// openai.js

import jsonSchemaGenerator from 'json-schema-generator';

/**
 * Calculates confidence scores for OpenAI model outputs
 * @param {Object} jsonOutput - The JSON output to validate
 * @param {Array<Object>} logprobs - Raw logprobs array from OpenAI API response
 * @param {Object} [schema=null] - Optional JSON schema
 * @returns {Object} - Confidence scores for each field
 */
export function calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema = null) {
    const tokens = logprobs.map(item => item.token);
    const token_probs = logprobs.map(item => Math.exp(item.logprob));

    // Generate schema if none provided
    const effectiveSchema = schema || jsonSchemaGenerator(jsonOutput);
    const schemaProperties = effectiveSchema.properties || {};
    const requiredFields = effectiveSchema.required || [];
    
    return calculateSchemaConfidence(jsonOutput, schemaProperties, tokens, token_probs, requiredFields);
}

/**
 * Calculates schema-based confidence scores for JSON output.
 * @param {Object} jsonOutput - JSON output to validate.
 * @param {Object} schemaProperties - Schema properties to validate against.
 * @param {Array<string>} tokens - Tokens from the logprobs.
 * @param {Array<number>} token_probs - Token probabilities.
 * @param {Array<string>} requiredFields - Required fields from the schema.
 * @param {string} parentKey - The parent key for nested structures.
 * @returns {Object} - Schema-based confidence scores.
 */
function calculateSchemaConfidence(jsonOutput, schemaProperties, tokens, token_probs, requiredFields, parentKey = '') {
    const confidenceScores = [];
    const confidenceResults = {};

    // Handle empty schema case
    if (Object.keys(schemaProperties).length === 0) {
        return {
            confidenceResults: {},
            minConfidence: 0,
            avgConfidence: 0
        };
    }

    Object.keys(schemaProperties).forEach((key) => {
        const schemaProperty = schemaProperties[key];
        const value = jsonOutput[key];
        const type = schemaProperty.type;
        const isRequired = requiredFields.includes(key);
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (value !== undefined) {
            // Check if value matches the schema type
            const isValid = validateType(value, type);

            // Calculate confidence based on tokens and their probabilities
            const relevantTokens = findRelevantTokens(tokens, token_probs, fullKey, value);
            const confidence = relevantTokens.length > 0 
                ? relevantTokens.reduce((acc, prob) => acc + prob, 0) / relevantTokens.length
                : 0;

            confidenceScores.push(confidence);

            // Handle nested objects and arrays
            if (type === 'object' && schemaProperty.properties) {
                const nestedConfidence = calculateSchemaConfidence(
                    value,
                    schemaProperty.properties,
                    tokens,
                    token_probs,
                    schemaProperty.required || [],
                    fullKey
                );
                
                confidenceResults[key] = {
                    value,
                    isValid,
                    confidence: Math.min(1, confidence),
                    ...nestedConfidence
                };
            } else if (type === 'array' && schemaProperty.items) {
                // Handle array items
                const arrayConfidence = value.map((item, index) => {
                    if (schemaProperty.items.type === 'object' && schemaProperty.items.properties) {
                        return calculateSchemaConfidence(
                            item,
                            schemaProperty.items.properties,
                            tokens,
                            token_probs,
                            schemaProperty.items.required || [],
                            `${fullKey}[${index}]`
                        );
                    } else {
                        const itemTokens = findRelevantTokens(tokens, token_probs, `${fullKey}[${index}]`, item);
                        const itemConfidence = itemTokens.length > 0 
                            ? itemTokens.reduce((acc, prob) => acc + prob, 0) / itemTokens.length
                            : 0;
                        
                        return {
                            value: item,
                            isValid: validateType(item, schemaProperty.items.type),
                            confidence: Math.min(1, itemConfidence)
                        };
                    }
                });

                confidenceResults[key] = {
                    value,
                    isValid,
                    confidence: Math.min(1, confidence),
                    items: arrayConfidence
                };
            } else {
                confidenceResults[key] = {
                    value,
                    isValid,
                    confidence: Math.min(1, confidence),
                };
            }
        } else {
            // Handle missing fields
            confidenceScores.push(0);
            confidenceResults[key] = {
                value: null,
                isValid: !isRequired,
                confidence: 0,
            };
        }
    });

    // Calculate min and average confidence scores
    const minConfidence = confidenceScores.length > 0 ? Math.min(...confidenceScores) : 0;
    const avgConfidence = confidenceScores.length > 0 
        ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
        : 0;

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
    const stringValue = JSON.stringify(value).replace(/^"|"$/g, ''); // Remove surrounding quotes
    const searchKey = key.toLowerCase();
    const searchValue = stringValue.toLowerCase();

    // Combine consecutive tokens for better matching
    let combinedToken = '';
    tokens.forEach((token, index) => {
        const cleanToken = token.replace(/^"|"$/g, '').toLowerCase();
        
        // Add current token to combined token
        combinedToken += cleanToken;
        
        // Check for matches in combined token
        if (combinedToken.includes(searchKey) || combinedToken.includes(searchValue)) {
            relevantProbs.push(token_probs[index]);
        }
        
        // Reset combined token if it ends with a delimiter
        if (token === ':' || token === ',' || token === '}') {
            combinedToken = '';
        }
    });

    return relevantProbs;
}
