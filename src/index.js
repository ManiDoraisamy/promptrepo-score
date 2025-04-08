import { calculateConfidenceScores as calculateOpenAIConfidenceScores } from './openai.js';

export function calculateConfidenceScores(jsonOutput, logprobs) 
{
    return calculateOpenAIConfidenceScores(jsonOutput, logprobs);
}
