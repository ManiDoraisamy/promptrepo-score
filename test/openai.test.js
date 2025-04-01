import { calculateOpenAIConfidenceScores } from '../src/openai.js';

describe('calculateOpenAIConfidenceScores', () => {
    const mockLogprobs = {
        tokens: [
            '"Currency"', ':', '"$"', ',',
            '"Page type"', ':', '"product"', ',',
            '"Product name"', ':', '"Chicken Stew"', ',',
            '"Price"', ':', '"12.99"'
        ],
        token_logprobs: [
            -0.1, -0.2, -0.1, -0.3,
            -0.1, -0.2, -0.1, -0.3,
            -0.1, -0.2, -0.1, -0.3,
            -0.1, -0.2, -0.1, -0.3
        ]
    };

    // Real OpenAI API logprobs format
    const realLogprobs = {
        tokens: [
            '{', '"', 'Currency', '"', ':', '"', '$', '"', ',',
            '"', 'Product', ' ', 'name', '"', ':', '"', 'Chicken', ' ', 'Stew', '"', ',',
            '"', 'Price', '"', ':', '"', '12', '.', '99', '"', '}'
        ],
        token_logprobs: [
            -0.05, -0.1, -0.2, -0.1, -0.05, -0.1, -0.3, -0.1, -0.05,
            -0.1, -0.15, -0.05, -0.2, -0.1, -0.05, -0.1, -0.25, -0.05, -0.2, -0.1, -0.05,
            -0.1, -0.2, -0.1, -0.05, -0.1, -0.3, -0.05, -0.3, -0.1, -0.05
        ]
    };

    const mockSchema = {
        type: 'object',
        required: ['Currency', 'Price'],
        properties: {
            Currency: { type: 'string' },
            'Page type': { type: 'string' },
            'Product name': { type: 'string' },
            Price: { type: 'string' }
        }
    };

    test('should calculate confidence scores with schema', () => {
        const jsonOutput = {
            Currency: '$',
            'Page type': 'product',
            'Product name': 'Chicken Stew',
            Price: '12.99'
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs, mockSchema);

        // Check structure
        expect(result).toHaveProperty('confidenceResults');
        expect(result).toHaveProperty('minConfidence');
        expect(result).toHaveProperty('avgConfidence');

        // Check confidence results
        expect(result.confidenceResults.Currency).toHaveProperty('value', '$');
        expect(result.confidenceResults.Currency).toHaveProperty('isValid', true);
        expect(result.confidenceResults.Currency).toHaveProperty('confidence');
        expect(result.confidenceResults.Currency.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.Currency.confidence).toBeLessThanOrEqual(1);

        // Check min and avg confidence
        expect(result.minConfidence).toBeGreaterThan(0);
        expect(result.avgConfidence).toBeGreaterThan(0);
        expect(result.minConfidence).toBeLessThanOrEqual(1);
        expect(result.avgConfidence).toBeLessThanOrEqual(1);
    });

    test('should calculate confidence scores without schema', () => {
        const jsonOutput = {
            Currency: '$',
            'Page type': 'product',
            'Product name': 'Chicken Stew',
            Price: '12.99'
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs);

        // Check structure
        expect(result).toHaveProperty('confidenceResults');
        expect(result).toHaveProperty('minConfidence');
        expect(result).toHaveProperty('avgConfidence');

        // Check confidence results
        expect(result.confidenceResults.Currency).toHaveProperty('value', '$');
        expect(result.confidenceResults.Currency).toHaveProperty('confidence');
        expect(result.confidenceResults.Currency.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.Currency.confidence).toBeLessThanOrEqual(1);

        // Check min and avg confidence
        expect(result.minConfidence).toBeGreaterThan(0);
        expect(result.avgConfidence).toBeGreaterThan(0);
        expect(result.minConfidence).toBeLessThanOrEqual(1);
        expect(result.avgConfidence).toBeLessThanOrEqual(1);
    });

    test('should handle nested objects', () => {
        const jsonOutput = {
            Currency: '$',
            'Product details': {
                name: 'Chicken Stew',
                price: '12.99'
            }
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs);

        // Check nested structure
        expect(result.confidenceResults).toHaveProperty('Currency');
        expect(result.confidenceResults['Product details']).toHaveProperty('name');
        expect(result.confidenceResults['Product details']).toHaveProperty('price');

        // Check confidence values
        expect(result.confidenceResults.Currency.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Product details'].name.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Product details'].price.confidence).toBeGreaterThan(0);
    });

    test('should handle empty objects', () => {
        const jsonOutput = {};
        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs);

        expect(result).toHaveProperty('confidenceResults');
        expect(Object.keys(result.confidenceResults)).toHaveLength(0);
        expect(result.minConfidence).toBe(0); // No fields = no confidence
        expect(result.avgConfidence).toBe(0); // No fields = no confidence
    });

    test('should handle missing required fields with schema', () => {
        const jsonOutput = {
            'Page type': 'product',
            'Product name': 'Chicken Stew'
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs, mockSchema);

        expect(result.confidenceResults.Currency).toHaveProperty('isValid', false);
        expect(result.confidenceResults.Currency.confidence).toBe(0);
        expect(result.confidenceResults.Price).toHaveProperty('isValid', false);
        expect(result.confidenceResults.Price.confidence).toBe(0);
    });

    test('should handle different value types', () => {
        const mixedSchema = {
            properties: {
                name: { type: 'string' },
                age: { type: 'integer' },
                price: { type: 'number' },
                inStock: { type: 'boolean' },
                tags: { type: 'array' },
                metadata: { type: 'object' }
            }
        };

        const jsonOutput = {
            name: 'Test Product',
            age: 5,
            price: 19.99,
            inStock: true,
            tags: ['new', 'featured'],
            metadata: { color: 'red' }
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs, mixedSchema);

        expect(result.confidenceResults.name.isValid).toBe(true);
        expect(result.confidenceResults.age.isValid).toBe(true);
        expect(result.confidenceResults.price.isValid).toBe(true);
        expect(result.confidenceResults.inStock.isValid).toBe(true);
        expect(result.confidenceResults.tags.isValid).toBe(true);
        expect(result.confidenceResults.metadata.isValid).toBe(true);
    });

    test('should calculate confidence with real OpenAI API logprobs', () => {
        const jsonOutput = {
            Currency: '$',
            'Product name': 'Chicken Stew',
            Price: '12.99'
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, realLogprobs);

        // Check structure
        expect(result).toHaveProperty('confidenceResults');
        expect(result.confidenceResults.Currency).toHaveProperty('value', '$');
        expect(result.confidenceResults['Product name']).toHaveProperty('value', 'Chicken Stew');
        expect(result.confidenceResults.Price).toHaveProperty('value', '12.99');

        // Verify confidence scores are calculated from actual token probabilities
        expect(result.confidenceResults.Currency.confidence).toBeGreaterThan(0.4);
        expect(result.confidenceResults['Product name'].confidence).toBeGreaterThan(0.4);
        expect(result.confidenceResults.Price.confidence).toBeGreaterThan(0.4);

        // Check overall confidence metrics
        expect(result.minConfidence).toBeGreaterThan(0.4);
        expect(result.avgConfidence).toBeGreaterThan(0.4);
    });

    test('should handle deeply nested objects', () => {
        const deepLogprobs = {
            tokens: [
                '"product"', ':', '{',
                '"details"', ':', '{',
                '"basic"', ':', '{',
                '"name"', ':', '"Chicken Stew"', ',',
                '"price"', ':', '{',
                '"amount"', ':', '"12.99"', ',',
                '"currency"', ':', '"$"',
                '}', '}',
                '"advanced"', ':', '{',
                '"nutrition"', ':', '{',
                '"calories"', ':', '"250"', ',',
                '"protein"', ':', '"20g"',
                '}', '}', '}', '}'
            ],
            token_logprobs: Array(40).fill(-0.1) // Fill with reasonable logprobs
        };

        const jsonOutput = {
            product: {
                details: {
                    basic: {
                        name: 'Chicken Stew',
                        price: {
                            amount: '12.99',
                            currency: '$'
                        }
                    },
                    advanced: {
                        nutrition: {
                            calories: '250',
                            protein: '20g'
                        }
                    }
                }
            }
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, deepLogprobs);

        // Check deep nesting structure
        expect(result.confidenceResults.product).toBeDefined();
        expect(result.confidenceResults.product.details).toBeDefined();
        expect(result.confidenceResults.product.details.basic).toBeDefined();
        expect(result.confidenceResults.product.details.basic.name).toBeDefined();
        expect(result.confidenceResults.product.details.basic.price).toBeDefined();

        // Check confidence values at each level
        expect(result.confidenceResults.product.details.basic.name.confidence).toBeGreaterThan(0.3);
        expect(result.confidenceResults.product.details.basic.price.amount.confidence).toBeGreaterThan(0.3);
        expect(result.confidenceResults.product.details.advanced.nutrition.calories.confidence).toBeGreaterThan(0.3);

        // Check overall metrics
        expect(result.minConfidence).toBeGreaterThan(0.3);
        expect(result.avgConfidence).toBeGreaterThan(0.3);
    });

    test('should handle arrays with nested objects', () => {
        const arrayLogprobs = {
            tokens: [
                '"items"', ':', '[', '{',
                '"id"', ':', '"1"', ',',
                '"name"', ':', '"Item 1"', ',',
                '"price"', ':', '"10.99"',
                '}', ',', '{',
                '"id"', ':', '"2"', ',',
                '"name"', ':', '"Item 2"', ',',
                '"price"', ':', '"20.99"',
                '}', ']'
            ],
            token_logprobs: Array(30).fill(-0.1)
        };

        const jsonOutput = {
            items: [
                { id: '1', name: 'Item 1', price: '10.99' },
                { id: '2', name: 'Item 2', price: '20.99' }
            ]
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, arrayLogprobs);

        expect(result.confidenceResults.items).toBeDefined();
        expect(result.confidenceResults.items[0]).toBeDefined();
        expect(result.confidenceResults.items[0].id.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.items[1].price.confidence).toBeGreaterThan(0);
    });

    test('should handle special characters in values', () => {
        const specialCharLogprobs = {
            tokens: [
                '"name"', ':', '"Product™"', ',',
                '"description"', ':', '"100% © 2024"', ',',
                '"price"', ':', '"$9.99"'
            ],
            token_logprobs: Array(15).fill(-0.1)
        };

        const jsonOutput = {
            name: 'Product™',
            description: '100% © 2024',
            price: '$9.99'
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, specialCharLogprobs);

        expect(result.confidenceResults.name.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.description.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.price.confidence).toBeGreaterThan(0);
    });

    test('should handle null and undefined values', () => {
        const nullLogprobs = {
            tokens: [
                '"name"', ':', '"Test"', ',',
                '"optional"', ':', 'null', ',',
                '"missing"', ':', 'undefined'
            ],
            token_logprobs: Array(15).fill(-0.1)
        };

        const jsonOutput = {
            name: 'Test',
            optional: null,
            missing: undefined
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, nullLogprobs);

        expect(result.confidenceResults.name.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.optional.confidence).toBe(0);
        expect(result.confidenceResults.missing.confidence).toBe(0);
    });

    test('should handle very long string values', () => {
        const longString = 'a'.repeat(1000);
        const longStringLogprobs = {
            tokens: [
                '"longText"', ':', '"' + longString + '"'
            ],
            token_logprobs: Array(1000).fill(-0.1)
        };

        const jsonOutput = {
            longText: longString
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, longStringLogprobs);

        expect(result.confidenceResults.longText.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.longText.value).toBe(longString);
    });

    test('should handle empty arrays and objects', () => {
        const emptyLogprobs = {
            tokens: [
                '"emptyArray"', ':', '[]', ',',
                '"emptyObject"', ':', '{}'
            ],
            token_logprobs: Array(10).fill(-0.1)
        };

        const jsonOutput = {
            emptyArray: [],
            emptyObject: {}
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, emptyLogprobs);

        expect(result.confidenceResults.emptyArray.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.emptyObject.confidence).toBeGreaterThan(0);
        expect(Array.isArray(result.confidenceResults.emptyArray.value)).toBe(true);
        expect(typeof result.confidenceResults.emptyObject.value).toBe('object');
    });

    test('should handle malformed JSON structure', () => {
        const malformedLogprobs = {
            tokens: [
                '"name"', ':', '"Test"', ',',
                '"nested"', ':', '{', '"key"', ':', '"value"'
            ],
            token_logprobs: Array(10).fill(-0.1)
        };

        const jsonOutput = {
            name: 'Test',
            nested: {
                key: 'value'
            }
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, malformedLogprobs);

        // Should still calculate confidence for the parts it can match
        expect(result.confidenceResults.name.confidence).toBeGreaterThan(0);
        expect(result.confidenceResults.nested.key.confidence).toBeGreaterThan(0);
    });

    test('should handle schema with nested required fields', () => {
        const nestedSchema = {
            type: 'object',
            required: ['outer', 'inner'],
            properties: {
                outer: {
                    type: 'object',
                    required: ['inner'],
                    properties: {
                        inner: { type: 'string' }
                    }
                }
            }
        };

        const jsonOutput = {
            outer: {
                inner: 'value'
            }
        };

        const result = calculateOpenAIConfidenceScores(jsonOutput, mockLogprobs, nestedSchema);

        expect(result.confidenceResults.outer).toBeDefined();
        expect(result.confidenceResults.outer.inner).toBeDefined();
        expect(result.confidenceResults.outer.inner.isValid).toBe(true);
        expect(result.confidenceResults.outer.inner.confidence).toBeGreaterThan(0);
    });
}); 