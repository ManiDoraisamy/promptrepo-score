import { calculateConfidenceScores } from '../src/openai.js';
import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Make an API call
const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant that returns JSON responses."
        },
        {
            role: "user",
            content: "Extract product information from: 'Product: Premium Widget, Price: $29.99'"
        }
    ],
    response_format: { type: "json_object" },
    logprobs: true,
    max_tokens: 500,
    temperature: 0
});

// Parse JSON response
const jsonOutput = JSON.parse(response.choices[0].message.content);

// Raw OpenAI output
console.log('OpenAI output:', jsonOutput);
// {
//   "Product name": "Premium Widget",
//   "Price": "29.99"
// }

// Calculate confidence scores
const result = calculateConfidenceScores(jsonOutput, response.choices[0].logprobs.content);

// @promptrepo/score output with confidence scores
console.log('Confidence scores:', result);
// {
//   "Product name": { value: "Premium Widget", score: 0.95 },
//   "Price": { value: "29.99", score: 0.92 }
// }
