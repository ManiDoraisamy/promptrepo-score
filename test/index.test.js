import { calculateConfidenceScores } from '../src/index.js';

describe('PromptRepo-Score Tests', () => {
    const sampleSchema = {
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "age": { "type": "integer" },
            "city": { "type": "string" }
        },
        "required": ["name", "age"]
    };

    const sampleJsonOutput = {
        "name": "Alice",
        "age": 25,
        "city": "Wonderland"
    };

    const sampleLogprobs = {
        tokens: ["\"name\"", ":", "\"Alice\"", ",", "\"age\"", ":", "25", ",", "\"city\"", ":", "\"Wonderland\""],
        token_logprobs: [-0.1, -0.5, -0.05, -0.8, -0.1, -0.4, -0.2, -0.3, -0.15, -0.4, -0.1]
    };

    test('should calculate confidence scores with schema', () => {
        const result = calculateConfidenceScores(sampleJsonOutput, sampleLogprobs, sampleSchema);
        
        // Check structure matches README example
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(result).toHaveProperty('city');

        // Check each field has correct structure
        expect(result.name).toHaveProperty('value', 'Alice');
        expect(result.name).toHaveProperty('isValid', true);
        expect(result.name).toHaveProperty('confidence');

        expect(result.age).toHaveProperty('value', 25);
        expect(result.age).toHaveProperty('isValid', true);
        expect(result.age).toHaveProperty('confidence');

        expect(result.city).toHaveProperty('value', 'Wonderland');
        expect(result.city).toHaveProperty('isValid', true);
        expect(result.city).toHaveProperty('confidence');
    });

    test('should calculate confidence scores without schema', () => {
        const result = calculateConfidenceScores(sampleJsonOutput, sampleLogprobs);
        
        // Check structure matches README example
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(result).toHaveProperty('city');

        // Check each field has correct structure (without isValid)
        expect(result.name).toHaveProperty('value', 'Alice');
        expect(result.name).toHaveProperty('confidence');
        expect(result.name).not.toHaveProperty('isValid');

        expect(result.age).toHaveProperty('value', 25);
        expect(result.age).toHaveProperty('confidence');
        expect(result.age).not.toHaveProperty('isValid');

        expect(result.city).toHaveProperty('value', 'Wonderland');
        expect(result.city).toHaveProperty('confidence');
        expect(result.city).not.toHaveProperty('isValid');
    });

    test('should handle invalid types according to schema', () => {
        const invalidJsonOutput = {
            "name": 123, // Should be string
            "age": "25", // Should be integer
            "city": "Wonderland"
        };

        const result = calculateConfidenceScores(invalidJsonOutput, sampleLogprobs, sampleSchema);
        
        expect(result.name.isValid).toBe(false);
        expect(result.age.isValid).toBe(false);
        expect(result.city.isValid).toBe(true);
    });

    test('should handle missing required fields', () => {
        const incompleteJsonOutput = {
            "name": "Alice"
            // age is missing
        };

        const result = calculateConfidenceScores(incompleteJsonOutput, sampleLogprobs, sampleSchema);
        
        expect(result.name.isValid).toBe(true);
        expect(result.age.isValid).toBe(false);
        expect(result.age.value).toBe(null);
        expect(result.age.confidence).toBe(0);
    });
}); 