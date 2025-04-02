import { calculateOpenAIConfidenceScores } from '../src/openai.js';
import nutriGeneratedData from './nutri.generated.json' assert { type: 'json' };

describe('Nutrition Generated Data Confidence Score Tests', () => {
    test('should calculate confidence scores for generated nutrition data', () => {
        const { data, logprobs: rawLogprobs, schema } = nutriGeneratedData;
        
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

        // Test required fields from schema
        expect(confidenceResults['Page Title']).toBeDefined();
        expect(confidenceResults['Page Body']).toBeDefined();
        expect(confidenceResults['Meta Description']).toBeDefined();
        expect(confidenceResults['Google category']).toBeDefined();
        expect(confidenceResults['Google category'].value).toBe('Food Items');
        expect(confidenceResults['Google category'].isValid).toBe(true);
        expect(confidenceResults['Sold by']).toBeDefined();
        expect(confidenceResults['Sold by'].value).toBe('quantity');
        expect(confidenceResults['Sold by'].isValid).toBe(true);
        expect(confidenceResults['Product image']).toBeDefined();
        expect(confidenceResults['Product description']).toBeDefined();
        expect(confidenceResults['Nutrition category']).toBeDefined();
        expect(confidenceResults['Nutrition category'].value).toBe('General foods');
        expect(confidenceResults['Nutrition category'].isValid).toBe(true);
        expect(confidenceResults['Serving size (grams or mL)']).toBeDefined();
        expect(confidenceResults['Serving size (grams or mL)'].value).toBe('300');
        expect(confidenceResults['Serving size (grams or mL)'].isValid).toBe(true);
        expect(confidenceResults['Nutrition information available in the input']).toBeDefined();
        expect(confidenceResults['Nutrition information available in the input'].value).toBe('No');
        expect(confidenceResults['Nutrition information available in the input'].isValid).toBe(true);
        expect(confidenceResults['Page URL']).toBeDefined();
        expect(confidenceResults['Page URL'].isValid).toBe(true);
    });
}); 