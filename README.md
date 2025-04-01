# @promptrepo/score

Calculate confidence score for JSON output from OpenAI

## Features

- Calculate confidence scores for OpenAI model outputs using token logprobs
- Support for both schema-based and schema-free validation
- Handles nested JSON structures and arrays
- Validates against JSON schemas with required fields
- Provides detailed confidence scores for each field
- Supports various data types (string, number, integer, boolean, object, array)

## Installation

```bash
npm install @promptrepo/score
```

## Usage

### Basic Usage

```javascript
import { calculateOpenAIConfidenceScores } from '@promptrepo/score';

const jsonOutput = {
    name: 'Product',
    price: '19.99',
    inStock: true
};

const logprobs = {
    tokens: ['"name"', ':', '"Product"', ...],
    token_logprobs: [-0.1, -0.2, -0.1, ...]
};

const result = calculateOpenAIConfidenceScores(jsonOutput, logprobs);
```

### With Schema Validation

```javascript
const schema = {
    type: 'object',
    required: ['name', 'price'],
    properties: {
        name: { type: 'string' },
        price: { type: 'string' },
        inStock: { type: 'boolean' }
    }
};

const result = calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema);
```

## API Reference

### calculateOpenAIConfidenceScores(jsonOutput, logprobs, schema?)

Calculates confidence scores for OpenAI model outputs.

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

## Features in Detail

### Schema Validation

When a schema is provided, the function validates the output against the schema and includes `isValid` flags in the results.

### Nested Structures

The package handles deeply nested JSON structures, calculating confidence scores for each level:

```javascript
const nestedOutput = {
    product: {
        details: {
            name: 'Product',
            price: '19.99'
        }
    }
};
```

### Array Support

Supports arrays of objects and primitive values:

```javascript
const arrayOutput = {
    items: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
    ]
};
```

### Edge Cases

The package handles various edge cases:
- Empty objects and arrays
- Null and undefined values
- Special characters in values
- Very long string values
- Malformed JSON structures
- Nested required fields in schemas

## Examples

### Basic Example

```javascript
const result = calculateOpenAIConfidenceScores(
    { name: 'Product', price: '19.99' },
    {
        tokens: ['"name"', ':', '"Product"', ...],
        token_logprobs: [-0.1, -0.2, -0.1, ...]
    }
);
```

### Schema Validation Example

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

### Nested Structure Example

```javascript
const result = calculateOpenAIConfidenceScores(
    {
        product: {
            details: {
                name: 'Product',
                price: '19.99'
            }
        }
    },
    logprobs
);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
