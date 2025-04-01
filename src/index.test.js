import { calculateConfidenceScores, calculateSemanticMatchRatio, getValidationResults } from './index.js';

describe('Prompt Scoring Tests', () => {
    const sampleJsonOutput = {
        name: "John Doe",
        age: 30,
        occupation: "Software Engineer"
    };

    const sampleLogprobs = {
        name: 0.95,
        age: 0.98,
        occupation: 0.92
    };

    const sampleDocument = "John Doe is a 30-year-old Software Engineer working in the tech industry.";

    test('calculateConfidenceScores returns correct structure', () => {
        const result = calculateConfidenceScores(sampleJsonOutput, sampleLogprobs);
        expect(result).toHaveProperty('confidenceScores');
        expect(result.confidenceScores).toHaveProperty('name');
        expect(result.confidenceScores).toHaveProperty('age');
        expect(result.confidenceScores).toHaveProperty('occupation');
    });

    test('calculateSemanticMatchRatio returns a number between 0 and 1', async () => {
        const result = await calculateSemanticMatchRatio(sampleDocument, sampleJsonOutput);
        expect(typeof result.matchRatio).toBe('number');
        expect(result.matchRatio).toBeGreaterThanOrEqual(0);
        expect(result.matchRatio).toBeLessThanOrEqual(1);
    });

    test('getValidationResults returns both confidence scores and match ratio', async () => {
        const result = await getValidationResults(sampleJsonOutput, sampleLogprobs, sampleDocument);
        expect(result).toHaveProperty('confidenceScores');
        expect(result).toHaveProperty('matchRatio');
        expect(typeof result.matchRatio).toBe('number');
    });
}); 