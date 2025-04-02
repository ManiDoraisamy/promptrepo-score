import { calculateOpenAIConfidenceScores } from '../src/openai.js';
import nutriData from './nutri.test.json';

describe('Nutrition Data Confidence Score Tests', () => {
    test('should calculate confidence scores for nutrition data', () => {
        const { data, logprobs: rawLogprobs } = nutriData;
        
        // Calculate confidence scores using raw logprobs
        const result = calculateOpenAIConfidenceScores(data, rawLogprobs);
        console.log(result);

        // Test basic structure
        expect(result).toHaveProperty('confidenceResults');
        expect(result).toHaveProperty('minConfidence');
        expect(result).toHaveProperty('avgConfidence');

        // Test confidence scores are within valid range
        expect(result.minConfidence).toBeGreaterThanOrEqual(0);
        expect(result.minConfidence).toBeLessThanOrEqual(1);
        expect(result.avgConfidence).toBeGreaterThanOrEqual(0);
        expect(result.avgConfidence).toBeLessThanOrEqual(1);

        // Test basic fields
        const { confidenceResults } = result;
        expect(confidenceResults['Product name']).toBeDefined();
        expect(confidenceResults['Product name'].value).toBe('八宝饭 Eight Jewel Rice Pudding (GF)');
        expect(confidenceResults['Product name'].confidence).toBeGreaterThan(0);

        expect(confidenceResults['Price']).toBeDefined();
        expect(confidenceResults['Price'].value).toBe('12');
        expect(confidenceResults['Price'].confidence).toBeGreaterThan(0);

        // Test array field
        expect(confidenceResults['Ingredients']).toBeDefined();
        expect(Array.isArray(confidenceResults['Ingredients'].value)).toBe(true);
        expect(confidenceResults['Ingredients'].value).toEqual([
            'Sticky Rice',
            'Red Bean',
            'Assorted Raisins',
            'Pumpkin Sugar'
        ]);
        expect(confidenceResults['Ingredients'].confidence).toBeGreaterThan(0);

        // Test nested nutrition data
        expect(confidenceResults['Nutrition per serving']).toBeDefined();
        const nutritionData = confidenceResults['Nutrition per serving'].confidenceResults;
        
        // Test specific nutrition fields
        expect(nutritionData['Calories (Kcal)'].value).toBe(400);
        expect(nutritionData['Calories (Kcal)'].confidence).toBeGreaterThan(0);
        
        expect(nutritionData['Carbohydrates (g)'].value).toBe(80);
        expect(nutritionData['Carbohydrates (g)'].confidence).toBeGreaterThan(0);
        
        expect(nutritionData['Protein (g)'].value).toBe(8);
        expect(nutritionData['Protein (g)'].confidence).toBeGreaterThan(0);

        // Test allergens
        expect(confidenceResults['Allergens']).toBeDefined();
        expect(Array.isArray(confidenceResults['Allergens'].value)).toBe(true);
        expect(confidenceResults['Allergens'].value).toEqual([
            'Cereals containing gluten',
            'Nuts'
        ]);
        expect(confidenceResults['Allergens'].confidence).toBeGreaterThan(0);

        // Test meta information
        expect(confidenceResults['Meta Information']).toBeDefined();
        const metaInfo = confidenceResults['Meta Information'].confidenceResults;
        expect(metaInfo['og:title'].value).toBe('八宝饭 Eight Jewel Rice Pudding (GF)');
        expect(metaInfo['og:title'].confidence).toBeGreaterThan(0);
        expect(metaInfo['og:price:amount'].value).toBe(12);
        expect(metaInfo['og:price:amount'].confidence).toBeGreaterThan(0);
    });

    test('should calculate confidence scores with schema validation', () => {
        const { data, logprobs: rawLogprobs } = nutriData;
        
        const schema = {
            type: 'object',
            required: ['Product name', 'Price', 'Ingredients'],
            properties: {
                'Product name': { type: 'string' },
                'Price': { type: 'string' },
                'Ingredients': { type: 'array' }
            }
        };

        const result = calculateOpenAIConfidenceScores(data, rawLogprobs, schema);

        // Test schema validation results
        expect(result.confidenceResults['Product name']).toBeDefined();
        expect(result.confidenceResults['Product name'].value).toBe('八宝饭 Eight Jewel Rice Pudding (GF)');
        expect(result.confidenceResults['Product name'].confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Product name'].isValid).toBe(true);

        expect(result.confidenceResults['Price']).toBeDefined();
        expect(result.confidenceResults['Price'].value).toBe('12');
        expect(result.confidenceResults['Price'].confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Price'].isValid).toBe(true);

        expect(result.confidenceResults['Ingredients']).toBeDefined();
        expect(Array.isArray(result.confidenceResults['Ingredients'].value)).toBe(true);
        expect(result.confidenceResults['Ingredients'].confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Ingredients'].isValid).toBe(true);
    });
}); 