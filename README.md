# @promptrepo/score

Calculate confidence scores for OpenAI JSON outputs. Transform black box responses into reliable data with granular field-level scoring.

## Why @promptrepo/score?

- 📊 **Precise Scoring**: Convert OpenAI's logprobs into confidence metrics for each JSON field
- 🔍 **Schema Validation**: Validate nested JSON structures while tracking field-level confidence
- 🛡️ **Production Tested**: Full test coverage including edge cases and real OpenAI API responses
- 🚀 **Simple Integration**: Works directly with OpenAI's completion and chat endpoints
- ⚡ **Lightweight**: Zero dependencies for core scoring logic

## Installation

```bash
npm install @promptrepo/score
```

## In Action

```javascript
import { calculateOpenAIConfidenceScores } from '@promptrepo/score';

// Your OpenAI response with JSON and logprobs
const result = calculateOpenAIConfidenceScores(jsonOutput, logprobs);

// Get confidence scores for each field
console.log(result.confidenceResults);
// {
//   name: { value: 'Product', confidence: 0.95 },
//   price: { value: '29.99', confidence: 0.92 }
// }

// Get overall confidence metrics
console.log(result.minConfidence); // 0.92
console.log(result.avgConfidence); // 0.935
```

## Use Cases
- 🎯 Validate AI outputs in production
- 📈 Monitor response quality
- 🔄 Build self-healing prompt systems
- ✅ Implement confidence thresholds
- 🏗️ Create reliable AI applications

## API Reference

### calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema?)

#### Parameters
- `jsonOutput` (Object): The JSON output to validate
- `logprobs` (Object): Logprobs object from OpenAI API response
  - `tokens` (Array<string>): Array of tokens
  - `token_logprobs` (Array<number>): Array of log probabilities
- `schema` (Object, optional): JSON schema for validation

#### Returns
```typescript
{
    confidenceResults: {
        [key: string]: {
            value: any,
            isValid?: boolean,  // Only present when schema is provided
            confidence: number
        }
    },
    minConfidence: number,
    avgConfidence: number
}
```

## Examples

### With Schema Validation
```javascript
const schema = {
    type: 'object',
    required: ['name', 'price'],
    properties: {
        name: { type: 'string' },
        price: { type: 'string' }
    }
};

const result = calculateOpenAIConfidenceScores(
    { name: 'Product', price: '19.99' },
    logprobs,
    schema
);
```

### Nested Structures
```javascript
const result = calculateOpenAIConfidenceScores({
    product: {
        details: {
            name: 'Product',
            price: '19.99'
        }
    }
}, logprobs);
```

## License

MIT
