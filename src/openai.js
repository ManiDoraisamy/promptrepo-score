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
    const confidenceResults = {};
    let minConfidence = 1;
    let totalConfidence = 0;
    let validCount = 0;

    // Process all fields in jsonOutput
    for (const [key, value] of Object.entries(jsonOutput)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const schema = schemaProperties[key];

        // Calculate confidence based on tokens and their probabilities
        const relevantTokens = findRelevantTokens(tokens, token_probs, fullKey, value);
        const confidence = relevantTokens.length > 0 
            ? relevantTokens.reduce((acc, prob) => acc + prob, 0) / relevantTokens.length
            : 0;

        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                // Handle arrays
                const arrayResults = value.map((item, index) => {
                    const itemKey = `${fullKey}[${index}]`;
                    const itemTokens = findRelevantTokens(tokens, token_probs, itemKey, item);
                    const itemConfidence = itemTokens.length > 0 
                        ? itemTokens.reduce((acc, prob) => acc + prob, 0) / itemTokens.length
                        : 0;
                    
                    return {
                        value: item,
                        isValid: true,
                        confidence: itemConfidence
                    };
                });

                const itemConfidences = arrayResults.map(item => item.confidence);
                const minItemConfidence = itemConfidences.length > 0 ? Math.min(...itemConfidences) : 0;
                const avgItemConfidence = itemConfidences.length > 0 
                    ? itemConfidences.reduce((sum, conf) => sum + conf, 0) / itemConfidences.length
                    : 0;

                confidenceResults[key] = {
                    value,
                    isValid: true,
                    confidence,
                    confidenceResults: arrayResults,
                    minConfidence: minItemConfidence,
                    avgConfidence: avgItemConfidence
                };
            } else {
                // Handle objects
                const nestedResults = calculateSchemaConfidence(
                    value,
                    schema?.properties || {},
                    tokens,
                    token_probs,
                    schema?.required || [],
                    fullKey
                );
                
                // Make nested values directly accessible
                const nestedConfidenceResults = {};
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    const nestedTokens = findRelevantTokens(tokens, token_probs, `${fullKey}.${nestedKey}`, nestedValue);
                    const nestedConfidence = nestedTokens.length > 0 
                        ? nestedTokens.reduce((acc, prob) => acc + prob, 0) / nestedTokens.length
                        : 0;
                    
                    nestedConfidenceResults[nestedKey] = {
                        value: nestedValue,
                        isValid: true,
                        confidence: nestedConfidence
                    };
                }
                
                confidenceResults[key] = {
                    value,
                    isValid: true,
                    confidence,
                    ...nestedConfidenceResults,
                    confidenceResults: nestedConfidenceResults,
                    minConfidence: nestedResults.minConfidence,
                    avgConfidence: nestedResults.avgConfidence
                };
            }
        } else {
            confidenceResults[key] = {
                value,
                isValid: true,
                confidence
            };
        }

        if (confidence > 0) {
            minConfidence = Math.min(minConfidence, confidence);
            totalConfidence += confidence;
            validCount++;
        }
    }

    const avgConfidence = validCount > 0 ? totalConfidence / validCount : 0;
    return {
        confidenceResults,
        minConfidence: minConfidence === 1 ? 0 : minConfidence,
        avgConfidence
    };
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
