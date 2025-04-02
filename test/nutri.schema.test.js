import { calculateOpenAIConfidenceScores } from '../src/openai.js';
import nutriSchemaData from './nutri.schema.json' assert { type: 'json' };

describe('Nutrition Schema Data Confidence Score Tests', () => {
    test('should calculate confidence scores for nutrition schema data', () => {
        const { data, logprobs: rawLogprobs, schema } = nutriSchemaData;
        
        // Calculate confidence scores using raw logprobs and schema
        const result = calculateOpenAIConfidenceScores(data, rawLogprobs, schema);
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
        expect(confidenceResults['Currency']).toBeDefined();
        expect(confidenceResults['Currency'].value).toBe('$');
        expect(confidenceResults['Currency'].confidence).toBeGreaterThan(0);
        expect(confidenceResults['Currency'].isValid).toBe(true);

        expect(confidenceResults['Page type']).toBeDefined();
        expect(confidenceResults['Page type'].value).toBe('product');
        expect(confidenceResults['Page type'].confidence).toBeGreaterThan(0);
        expect(confidenceResults['Page type'].isValid).toBe(true);

        // Test array fields
        expect(confidenceResults['Ingredients']).toBeDefined();
        expect(Array.isArray(confidenceResults['Ingredients'].value)).toBe(true);
        expect(confidenceResults['Ingredients'].value).toEqual([
            'Sticky Rice',
            'Red Bean',
            'Assorted Raisins',
            'Pumpkin Sugar'
        ]);
        expect(confidenceResults['Ingredients'].confidence).toBeGreaterThan(0);
        expect(confidenceResults['Ingredients'].isValid).toBe(true);

        // Test nested nutrition data
        expect(confidenceResults['Nutrition per serving']).toBeDefined();
        const nutritionData = confidenceResults['Nutrition per serving'];
        
        // Test specific nutrition fields
        expect(nutritionData['Calories (Kcal)'].value).toBe(400);
        expect(nutritionData['Calories (Kcal)'].confidence).toBeGreaterThan(0);
        expect(nutritionData['Calories (Kcal)'].isValid).toBe(true);
        
        expect(nutritionData['Carbohydrates (g)'].value).toBe(80);
        expect(nutritionData['Carbohydrates (g)'].confidence).toBeGreaterThan(0);
        expect(nutritionData['Carbohydrates (g)'].isValid).toBe(true);
        
        expect(nutritionData['Protein (g)'].value).toBe(8);
        expect(nutritionData['Protein (g)'].confidence).toBeGreaterThan(0);
        expect(nutritionData['Protein (g)'].isValid).toBe(true);

        // Test allergens
        expect(confidenceResults['Allergens']).toBeDefined();
        expect(Array.isArray(confidenceResults['Allergens'].value)).toBe(true);
        expect(confidenceResults['Allergens'].value).toEqual([
            'Cereals containing gluten',
            'Nuts'
        ]);
        expect(confidenceResults['Allergens'].confidence).toBeGreaterThan(0);
        expect(confidenceResults['Allergens'].isValid).toBe(true);

        // Test meta information
        expect(confidenceResults['Meta Information']).toBeDefined();
        const metaInfo = confidenceResults['Meta Information'];
        expect(metaInfo['og:title'].value).toBe('八宝饭 Eight Jewel Rice Pudding (GF)');
        expect(metaInfo['og:title'].confidence).toBeGreaterThan(0);
        expect(metaInfo['og:title'].isValid).toBe(true);
        expect(metaInfo['og:price:amount'].value).toBe(12);
        expect(metaInfo['og:price:amount'].confidence).toBeGreaterThan(0);
        expect(metaInfo['og:price:amount'].isValid).toBe(true);
    });

    test('should calculate confidence scores with schema validation', () => {
        const { data, logprobs: rawLogprobs } = nutriSchemaData;
        
        const schema = {
            type: 'object',
            required: ['Currency', 'Page type', 'Ingredients'],
            properties: {
                'Currency': { type: 'string' },
                'Page type': { type: 'string' },
                'Ingredients': { type: 'array' }
            }
        };

        const result = calculateOpenAIConfidenceScores(data, rawLogprobs, schema);

        // Test schema validation results
        expect(result.confidenceResults['Currency']).toBeDefined();
        expect(result.confidenceResults['Currency'].value).toBe('$');
        expect(result.confidenceResults['Currency'].confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Currency'].isValid).toBe(true);

        expect(result.confidenceResults['Page type']).toBeDefined();
        expect(result.confidenceResults['Page type'].value).toBe('product');
        expect(result.confidenceResults['Page type'].confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Page type'].isValid).toBe(true);

        expect(result.confidenceResults['Ingredients']).toBeDefined();
        expect(Array.isArray(result.confidenceResults['Ingredients'].value)).toBe(true);
        expect(result.confidenceResults['Ingredients'].confidence).toBeGreaterThan(0);
        expect(result.confidenceResults['Ingredients'].isValid).toBe(true);
    });
}); 