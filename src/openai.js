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
 * Calculates confidence scores for a JSON output based on OpenAI logprobs.
 * If a schema is provided, calculates schema-based confidence scores. Otherwise, calculates attribute-level confidence dynamically.
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Object} logprobs - Logprobs object from OpenAI API response.
 * @param {Object} [schema=null] - The JSON schema (optional).
 * @returns {Object} - Validation results and confidence scores.
 */
function calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema = null) {
    const confidenceScores = {};
    const { tokens, token_probs } = parseLogprobs(logprobs);

    if (schema) {
        const schemaProperties = schema.properties || {};

        Object.keys(schemaProperties).forEach((key) => {
            if (jsonOutput[key] !== undefined) {
                const value = jsonOutput[key];
                const type = schemaProperties[key].type;

                // Check if value matches the schema type
                const isValid = validateType(value, type);

                // Calculate confidence based on tokens and their probabilities
                const relevantTokens = findRelevantTokens(tokens, token_probs, key, value);
                const confidence = relevantTokens.reduce((acc, prob) => acc * prob, 1);

                confidenceScores[key] = {
                    value,
                    isValid,
                    confidence: Math.min(1, confidence), // Ensure confidence is ≤ 1
                };
            } else {
                confidenceScores[key] = {
                    value: null,
                    isValid: !schema.required || !schema.required.includes(key),
                    confidence: 0, // Missing required fields get 0 confidence
                };
            }
        });
    } else {
        // Calculate attribute-level confidence for schema-less outputs
        Object.keys(jsonOutput).forEach((key) => {
            const value = jsonOutput[key];
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

            confidenceScores[key] = {
                value,
                confidence: Math.min(1, confidence),
            };
        });
    }

    return confidenceScores;
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

module.exports = { calculateOpenAIConfidenceScores };
