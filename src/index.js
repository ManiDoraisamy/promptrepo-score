import { calculateConfidenceScores as calculateOpenAIConfidenceScores } from './openai.js';
import { evaluate } from './semantic.js';

/**
 * Calculates confidence scores for structured outputs
 * @param {Object} jsonOutput - The JSON output to validate
 * @param {Object} logprobs - Logprobs object from OpenAI API response
 * @param {Object} [schema=null] - Optional JSON schema
 * @returns {Object} - Validation results and confidence scores
 */
export function calculateConfidenceScores(jsonOutput, logprobs, schema = null) {
    const result = {};
    const confidenceScores = calculateOpenAIConfidenceScores(jsonOutput, logprobs);
    
    for (const [key, value] of Object.entries(jsonOutput)) {
        if (schema) {
            // Schema-based validation
            const schemaProperty = schema.properties[key];
            const isValid = validateAgainstSchema(value, schemaProperty);
            const isRequired = schema.required?.includes(key);
            
            result[key] = {
                value,
                isValid,
                confidence: confidenceScores[key] || 0.5
            };
        } else {
            // Schema-less validation
            result[key] = {
                value,
                confidence: confidenceScores[key] || 0.5
            };
        }
    }

    // Handle missing required fields
    if (schema?.required) {
        for (const requiredField of schema.required) {
            if (!jsonOutput.hasOwnProperty(requiredField)) {
                result[requiredField] = {
                    value: null,
                    isValid: false,
                    confidence: 0
                };
            }
        }
    }
    
    return result;
}

/**
 * Validates a value against a schema property
 * @private
 */
function validateAgainstSchema(value, schemaProp) {
    if (!schemaProp) return true;
    
    switch (schemaProp.type) {
        case 'string':
            return typeof value === 'string';
        case 'integer':
            return Number.isInteger(value);
        case 'number':
            return typeof value === 'number';
        default:
            return true;
    }
}

/**
 * Calculates semantic match ratio between a document and form.
 * @param {string} document - The document text to validate.
 * @param {Object} form - The form structure to compare.
 * @returns {Object} - Semantic match ratio.
 */
export async function calculateSemanticMatchRatio(document, form) {
    try {
        const result = await evaluate(document, form);
        return result;  // This will contain the match ratio
    } catch (err) {
        console.error("Error calculating semantic match ratio:", err);
        throw err;  // Re-throw error for handling in the calling context
    }
}

/**
 * A single function to get both confidence scores and semantic match ratio.
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Object} logprobs - Logprobs object from OpenAI API response.
 * @param {string} document - The document text to validate.
 * @returns {Object} - Combined results (confidence scores and semantic match ratio).
 */
export async function getValidationResults(jsonOutput, logprobs, document) {
    try {
        // Get confidence scores
        const confidenceScores = calculateConfidenceScores(jsonOutput, logprobs);

        // Get semantic match ratio
        const semanticResult = await calculateSemanticMatchRatio(document, jsonOutput);

        return {
            confidenceScores,
            matchRatio: semanticResult.matchRatio  // Extract just the number
        };
    } catch (error) {
        console.error("Error in getValidationResults:", error);
        throw error;
    }
}
