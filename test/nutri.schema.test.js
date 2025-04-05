import { calculateConfidenceScores } from '../src/openai.js';
import nutriData from './nutri.schema.json'; // Use schema JSON for input

describe('Nutrition Schema Data Confidence Score Tests', () => {
    test('should calculate confidence scores for nutrition data (no schema applied)', () => {
        const { data, logprobs: rawLogprobs } = nutriData;
        
        // Calculate confidence scores (schema argument is ignored)
        const result = calculateConfidenceScores(data, rawLogprobs);
        console.log('result', JSON.stringify(result, null, 2));

        // Test basic structure and fields
        expect(result['Product name']).toBeDefined();
        expect(result['Product name'].value).toBe('八宝饭 Eight Jewel Rice Pudding (GF)');
        expect(result['Product name'].score).toBeGreaterThanOrEqual(0);
        expect(result['Product name'].score).toBeLessThanOrEqual(1);

        expect(result['Price']).toBeDefined();
        expect(result['Price'].value).toBe('12'); // Value from nutri.schema.json
        expect(result['Price'].score).toBeGreaterThanOrEqual(0);
        expect(result['Price'].score).toBeLessThanOrEqual(1);

        // Test array field
        expect(result['Ingredients']).toBeDefined();
        expect(Array.isArray(result['Ingredients'].value)).toBe(true);
        expect(result['Ingredients'].value).toEqual([
            'Sticky Rice',
            'Red Bean',
            'Assorted Raisins',
            'Pumpkin Sugar'
        ]);
        expect(result['Ingredients'].score).toBeGreaterThanOrEqual(0);
        expect(result['Ingredients'].score).toBeLessThanOrEqual(1);

        // Test nested nutrition data
        expect(result['Nutrition per serving']).toBeDefined();
        const nutritionData = result['Nutrition per serving'].value;
        
        // Check a few nested fields
        expect(nutritionData['Calories (Kcal)'].value).toBe(400);
        expect(nutritionData['Calories (Kcal)'].score).toBeGreaterThanOrEqual(0);
        expect(nutritionData['Calories (Kcal)'].score).toBeLessThanOrEqual(1);
        
        expect(nutritionData['Carbohydrates (g)'].value).toBe(80);
        expect(nutritionData['Carbohydrates (g)'].score).toBeGreaterThanOrEqual(0);
        expect(nutritionData['Carbohydrates (g)'].score).toBeLessThanOrEqual(1);
        
        // Test allergens
        expect(result['Allergens']).toBeDefined();
        expect(Array.isArray(result['Allergens'].value)).toBe(true);
        expect(result['Allergens'].value).toEqual([
            'Cereals containing gluten',
            'Nuts'
        ]);
        expect(result['Allergens'].score).toBeGreaterThanOrEqual(0);
        expect(result['Allergens'].score).toBeLessThanOrEqual(1);

        // Test another top-level field
        expect(result['Serving size (grams or mL)']).toBeDefined();
        expect(result['Serving size (grams or mL)'].value).toBe('300');
        expect(result['Serving size (grams or mL)'].score).toBeGreaterThanOrEqual(0);
        expect(result['Serving size (grams or mL)'].score).toBeLessThanOrEqual(1);
    });

    // No longer need the second test case specific to schema validation
}); 