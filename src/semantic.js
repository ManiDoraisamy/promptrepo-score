import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Evaluates semantic similarity between a document and a form structure
 * @param {string} document - The document text to validate
 * @param {Object} form - The form structure to compare
 * @returns {Object} - Match ratio and details
 */
export async function evaluate(document, form) {
    // Create TF-IDF vectors
    const tfidf = new TfIdf();
    
    // Add document to TF-IDF
    tfidf.addDocument(document);
    
    // Add form values to TF-IDF
    const formText = Object.values(form)
        .filter(value => typeof value === 'string' || typeof value === 'number')
        .map(value => String(value))
        .join(' ');
    tfidf.addDocument(formText);
    
    // Calculate cosine similarity
    const vectors = tfidf.listTerms(0).map(item => item.tfidf);
    const formVectors = tfidf.listTerms(1).map(item => item.tfidf);
    
    // Calculate match ratio (cosine similarity)
    const matchRatio = cosineSimilarity(vectors, formVectors);
    
    return {
        matchRatio: matchRatio,  // Return as a number, not an object
        details: {
            documentLength: document.length,
            formLength: formText.length,
            vectorLength: vectors.length
        }
    };
}

/**
 * Calculates cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Cosine similarity score
 */
function cosineSimilarity(vec1, vec2) {
    // Pad vectors to same length if necessary
    const maxLength = Math.max(vec1.length, vec2.length);
    while (vec1.length < maxLength) vec1.push(0);
    while (vec2.length < maxLength) vec2.push(0);
    
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < maxLength; i++) {
        dotProduct += vec1[i] * vec2[i];
    }
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
}
