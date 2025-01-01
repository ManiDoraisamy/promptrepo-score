const { calculateOpenAIConfidenceScores } = require('./openai');
const { evaluate } = require('./semantic.js');

/**
 * Delegates confidence score calculation to OpenAI-specific logic.
 * Supports schema-based and schema-less calculations.
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Object} logprobs - Logprobs object from OpenAI API response.
 * @param {Object} [schema=null] - The JSON schema (optional).
 * @returns {Object} - Validation results and confidence scores.
 */
function calculateConfidenceScores(jsonOutput, logprobs, schema = null) {
    return calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema);
}

/**
 * Calculates semantic match ratio between a document and form.
 * @param {string} document - The document text to validate.
 * @param {Object} form - The form structure to compare.
 * @returns {Object} - Semantic match ratio.
 */
async function calculateSemanticMatchRatio(document, form) {
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
async function getValidationResults(jsonOutput, logprobs, document) {
    try {
        // Get confidence scores
        const confidenceScores = calculateConfidenceScores(jsonOutput, logprobs);

        // Get semantic match ratio
        const matchRatio = await calculateSemanticMatchRatio(document, jsonOutput);

        return {
            confidenceScores,
            matchRatio
        };
    } catch (error) {
        console.error("Error in getValidationResults:", error);
        throw error;
    }
}

module.exports = { calculateConfidenceScores, calculateSemanticMatchRatio, getValidationResults };

