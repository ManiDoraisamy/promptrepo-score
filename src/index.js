// index.js

const { calculateOpenAIConfidenceScores } = require('./openai');

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

module.exports = { calculateConfidenceScores };
