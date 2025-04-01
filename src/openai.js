// openai.js

/**
 * Parses logprobs from OpenAI API responses and prepares token probabilities.
 * @param {Object} logprobs - OpenAI logprobs object.
 * @returns {Object} - Formatted token probabilities.
 */
function parseLogprobs(logprobs) {
    const { tokens, token_logprobs } = logprobs;
    return {
        tokens,
        token_probs: token_logprobs.map((logprob) => Math.exp(logprob)), // Convert logprobs to probabilities
    };
}

/**
 * Recursively calculates confidence scores for a nested JSON structure.
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Object} tokens - Tokens from the logprobs object.
 * @param {Array<number>} token_probs - Probabilities of each token.
 * @returns {Object} - Attribute-level confidence scores, including nested structures.
 */
function calculateNestedConfidence(jsonOutput, tokens, token_probs) {
    const confidenceScores = [];
    const confidenceResults = {};

    // Loop through each key in the JSON output
    Object.keys(jsonOutput).forEach((key) => {
        const value = jsonOutput[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recursively handle nested objects
            const nestedConfidence = calculateNestedConfidence(value, tokens, token_probs);

            // Ensure nestedConfidence includes these properties
            if (nestedConfidence.confidenceScores) {
                confidenceScores.push(...nestedConfidence.confidenceScores);
            }
            if (nestedConfidence.confidenceResults) {
                confidenceResults[key] = nestedConfidence.confidenceResults;
            }
        } else {
            const stringValue = JSON.stringify(value);

            // Find relevant tokens for the key and value
            const relevantTokens = tokens.map((token, index) => {
                if (token.includes(key) || token.includes(stringValue)) {
                    return token_probs[index];
                }
                return null;
            }).filter(Boolean);

            // Calculate confidence as product of relevant token probabilities
            const confidence = relevantTokens.reduce((acc, prob) => acc * prob, 1);

            confidenceScores.push(confidence);
            confidenceResults[key] = {
                value,
                confidence: Math.min(1, confidence),
            };
        }
    });

    // Calculate min and average confidence scores
    const minConfidence = Math.min(...confidenceScores);
    const avgConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    return {
        confidenceResults,
        confidenceScores,
        minConfidence,
        avgConfidence
    };
}

/**
 * Calculates confidence scores for OpenAI model outputs
 * @param {Object} jsonOutput - The JSON output to validate
 * @param {Object} logprobs - Logprobs object from OpenAI API response
 * @param {Object} [schema=null] - Optional JSON schema
 * @returns {Object} - Confidence scores for each field
 */
export function calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema = null) {
    const confidenceScores = {};
    
    // Calculate confidence scores for each field
    for (const [key, value] of Object.entries(jsonOutput)) {
        if (logprobs[key]) {
            confidenceScores[key] = logprobs[key];
        } else {
            // If no logprob available, use a default confidence
            confidenceScores[key] = 0.5;
        }
    }

    return {
        confidenceScores,
        schema: schema || null
    };
}

/**
 * Calculates schema-based confidence scores for JSON output.
 * @param {Object} jsonOutput - JSON output to validate.
 * @param {Object} schemaProperties - Schema properties to validate against.
 * @param {Array<string>} tokens - Tokens from the logprobs.
 * @param {Array<number>} token_probs - Token probabilities.
 * @returns {Object} - Schema-based confidence scores.
 */
function calculateSchemaConfidence(jsonOutput, schemaProperties, tokens, token_probs) {
    const confidenceScores = [];
    const confidenceResults = {};

    Object.keys(schemaProperties).forEach((key) => {
        if (jsonOutput[key] !== undefined) {
            const value = jsonOutput[key];
            const type = schemaProperties[key].type;

            // Check if value matches the schema type
            const isValid = validateType(value, type);

            // Calculate confidence based on tokens and their probabilities
            const relevantTokens = findRelevantTokens(tokens, token_probs, key, value);
            const confidence = relevantTokens.reduce((acc, prob) => acc * prob, 1);

            confidenceScores.push(confidence);
            confidenceResults[key] = {
                value,
                isValid,
                confidence: Math.min(1, confidence), // Ensure confidence is ≤ 1
            };
        } else {
            confidenceScores.push(0); // Missing required fields get 0 confidence
            confidenceResults[key] = {
                value: null,
                isValid: !schemaProperties.required || !schemaProperties.required.includes(key),
                confidence: 0,
            };
        }
    });

    // Calculate min and average confidence scores
    const minConfidence = Math.min(...confidenceScores);
    const avgConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    return {
        confidenceResults,
        minConfidence,
        avgConfidence
    };
}

/**
 * Function to validate a value against a type.
 * @param {any} value - The value to validate.
 * @param {string} type - The expected type.
 * @returns {boolean} - Whether the value is valid for the type.
 */
function validateType(value, type) {
    switch (type) {
        case "string":
            return typeof value === "string";
        case "number":
            return typeof value === "number";
        case "integer":
            return Number.isInteger(value);
        case "boolean":
            return typeof value === "boolean";
        case "object":
            return typeof value === "object" && !Array.isArray(value);
        case "array":
            return Array.isArray(value);
        default:
            return false;
    }
}

/**
 * Function to find relevant tokens and their probabilities for a given key and value.
 * @param {Array<string>} tokens - The list of tokens.
 * @param {Array<number>} token_probs - Probabilities of each token.
 * @param {string} key - The attribute key from the schema.
 * @param {any} value - The attribute value from the JSON output.
 * @returns {Array<number>} - Probabilities of the tokens related to the key and value.
 */
function findRelevantTokens(tokens, token_probs, key, value) {
    const relevantProbs = [];
    const stringValue = JSON.stringify(value); // Convert value to string for matching

    tokens.forEach((token, index) => {
        if (token.includes(key) || token.includes(stringValue)) {
            relevantProbs.push(token_probs[index]);
        }
    });

    return relevantProbs;
}
