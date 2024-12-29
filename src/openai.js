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
    token_probs: token_logprobs.map((lp) => Math.exp(lp)), // Convert logprobs to probabilities
  };
}

/**
 * Recursively calculates confidence scores for a nested JSON structure (no schema).
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Array<string>} tokens - Tokens from the logprobs object.
 * @param {Array<number>} token_probs - Probabilities of each token.
 * @returns {Object} - Attribute-level confidence scores, including nested structures.
 */
function calculateNestedConfidence(jsonOutput, tokens, token_probs) {
  const confidenceScores = {};
  Object.keys(jsonOutput).forEach((key) => {
    const value = jsonOutput[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively handle nested objects
      confidenceScores[key] = calculateNestedConfidence(value, tokens, token_probs);
    } else {
      // Match tokens for key & value
      const stringValue = JSON.stringify(value);
      const relevantTokens = tokens
        .map((token, idx) => (token.includes(key) || token.includes(stringValue) ? token_probs[idx] : null))
        .filter(Boolean);
      const confidence = relevantTokens.reduce((acc, p) => acc * p, 1);
      confidenceScores[key] = { value, confidence: Math.min(1, confidence) };
    }
  });
  return confidenceScores;
}

/**
 * Calculates schema-based confidence scores for JSON output (handles nesting).
 * @param {Object} jsonOutput - JSON output to validate.
 * @param {Object} schemaNode - Schema object (containing properties, required, etc.).
 * @param {Array<string>} tokens - Tokens from the logprobs.
 * @param {Array<number>} token_probs - Token probabilities.
 * @returns {Object} - Schema-based confidence scores.
 */
function calculateSchemaConfidence(jsonOutput, schemaNode, tokens, token_probs) {
  const { properties = {}, required = [] } = schemaNode;
  const confidenceScores = {};

  Object.keys(properties).forEach((key) => {
    const propSchema = properties[key];
    const { type } = propSchema;
    const value = jsonOutput[key];

    // If value is missing
    if (value === undefined) {
      confidenceScores[key] = {
        value: null,
        isValid: !required.includes(key),
        confidence: 0,
      };
      return;
    }

    // If the schema type is object and has nested properties, recurse
    if (type === "object" && propSchema.properties && typeof value === "object") {
      confidenceScores[key] = calculateSchemaConfidence(value, propSchema, tokens, token_probs);
    } else {
      const isValid = validateType(value, type);
      const relevantTokens = findRelevantTokens(tokens, token_probs, key, value);
      const confidence = relevantTokens.reduce((acc, p) => acc * p, 1);

      confidenceScores[key] = {
        value,
        isValid,
        confidence: Math.min(1, confidence),
      };
    }
  });
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
 * Helper to find tokens/probabilities for a given key-value pair.
 * @param {Array<string>} tokens
 * @param {Array<number>} token_probs
 * @param {string} key
 * @param {any} value
 * @returns {Array<number>}
 */
function findRelevantTokens(tokens, token_probs, key, value) {
  const stringValue = JSON.stringify(value);
  const relevant = [];
  tokens.forEach((token, idx) => {
    if (token.includes(key) || token.includes(stringValue)) relevant.push(token_probs[idx]);
  });
  return relevant;
}

/**
 * Main function to calculate confidence scores.
 * @param {Object} jsonOutput - The JSON output to validate.
 * @param {Object} logprobs - Logprobs object from OpenAI API response.
 * @param {Object} [schema=null] - The JSON schema (optional).
 * @returns {Object} - Validation results and confidence scores.
 */
function calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema = null) {
  const { tokens, token_probs } = parseLogprobs(logprobs);
  return schema
    ? calculateSchemaConfidence(jsonOutput, schema, tokens, token_probs)
    : calculateNestedConfidence(jsonOutput, tokens, token_probs);
}

module.exports = { calculateOpenAIConfidenceScores };
