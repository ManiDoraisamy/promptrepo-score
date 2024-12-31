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

module.exports = { calculateConfidenceScores, calculateSemanticMatchRatio };


// // index.js

// const { calculateOpenAIConfidenceScores } = require('./openai');

// /**
//  * Delegates confidence score calculation to OpenAI-specific logic.
//  * Supports schema-based and schema-less calculations.
//  * @param {Object} jsonOutput - The JSON output to validate.
//  * @param {Object} logprobs - Logprobs object from OpenAI API response.
//  * @param {Object} [schema=null] - The JSON schema (optional).
//  * @returns {Object} - Validation results and confidence scores.
//  */
// function calculateConfidenceScores(jsonOutput, logprobs, schema = null) {
//     return calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema);
// }

// module.exports = { calculateConfidenceScores };
