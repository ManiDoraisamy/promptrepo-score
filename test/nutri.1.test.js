import { calculateConfidenceScores } from '../src/openai.js';
import nutriData from './nutri.1.json';

describe('Nutrition Data Confidence Score Tests', () => {
    test('should calculate confidence scores for nutrition data', () => {
        const { data, logprobs: rawLogprobs } = nutriData;
        
        // Calculate confidence scores (schema argument is ignored)
        const result = calculateConfidenceScores(data, rawLogprobs);
        console.log('result', JSON.stringify(result, null, 2));
        const servingSize = result['Serving size (grams or mL)'];
        console.log('result', JSON.stringify(servingSize, null, 2));

        expect(result['Serving size (grams or mL)']).toBeDefined();
        expect(result['Serving size (grams or mL)'].value).toBe(300);
        expect(result['Serving size (grams or mL)'].score).toBeGreaterThanOrEqual(0);
        expect(result['Serving size (grams or mL)'].score).toBeLessThanOrEqual(1);
    });
}); 