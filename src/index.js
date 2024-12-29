// index.js

const { calculateOpenAIConfidenceScores } = require('./openai');

/**
 * Delegates confidence score calculation to OpenAI-specific logic.
 * @param {Object} schema - The JSON schema.
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Object} logprobs - Logprobs object from OpenAI API response.
 * @returns {Object} - Validation results and confidence scores.
 */
function calculateConfidenceScores(schema, jsonOutput, logprobs) {
    return calculateOpenAIConfidenceScores(schema, jsonOutput, logprobs);
}

module.exports = { calculateConfidenceScores };
