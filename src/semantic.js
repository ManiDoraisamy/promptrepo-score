const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs-node'); // Ensure TensorFlow.js is installed

// Extract key fields from markdown
function extractFieldsFromMarkdown(markdown) {
    const regex = /([A-Za-z\s]+:|[A-Za-z\s]+|[A-Za-z\s]+\?+|[A-Za-z\s]+\.+|[A-Za-z\s]+_+)/g;
    const potentialFields = markdown.match(regex);
    if (!potentialFields) return []; // Handle cases where no matches are found
    const fieldNames = potentialFields.map(match => match.replace(/[\s_:?\.]+/g, " ").trim());
    return [...new Set(fieldNames)]; // Remove duplicates
}

// Compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    const dotProduct = tf.matMul(vecA, vecB, false, true).dataSync()[0];
    const normA = tf.norm(vecA).dataSync()[0];
    const normB = tf.norm(vecB).dataSync()[0];
    return dotProduct / (normA * normB);
}

async function evaluateSemanticSimilarity(extractedFields, responseFields, threshold = 0.6) {
    const matchedPairs = [];
    const matchedResponseFields = new Set();

    // Load the Universal Sentence Encoder model
    const model = await use.load();

    // Generate embeddings for extracted fields
    const extractedEmbeddings = await model.embed(extractedFields);

    // Generate embeddings for response fields
    const responseEmbeddings = await model.embed(responseFields);

    // // Log the extracted and response fields along with their embeddings for debugging
    // console.log("Extracted Fields:", extractedFields);
    // console.log("Response Fields:", responseFields);


    // Compute cosine similarity between each pair of embeddings
    for (let i = 0; i < extractedEmbeddings.shape[0]; i++) {
        for (let j = 0; j < responseEmbeddings.shape[0]; j++) {
            if (matchedResponseFields.has(responseFields[j])) {
                continue; // Skip already matched response fields
            }
            const simScore = cosineSimilarity(
                extractedEmbeddings.slice([i, 0], [1, -1]),
                responseEmbeddings.slice([j, 0], [1, -1])
            );

            // // Log each semantic similarity score for debugging
            // console.log(`Similarity between extracted field "${extractedFields[i]}" and response field "${responseFields[j]}":`, simScore);

            if (simScore >= threshold) {
                matchedPairs.push([extractedFields[i], responseFields[j], simScore]);
                matchedResponseFields.add(responseFields[j]); // Mark as matched
                break; // Move to the next extracted field
            }
        }
    }

    // // Log matched pairs for debugging
    // console.log("Matched Pairs:", matchedPairs);
    // console.log("Matched Response Fields:", Array.from(matchedResponseFields)); // Convert Set to array for easier viewing

    // Calculate match ratio using the responseFields count as the denominator
    const matchRatio = responseFields.length ? matchedPairs.length / responseFields.length : 0;
    
    // // Log the final match ratio for debugging
    // console.log("Match Ratio:", matchRatio);

    return matchRatio;
}

// Evaluate the input and response
async function evaluate(document, form) {
    try {
        const extractedFields = extractFieldsFromMarkdown(document);
        let responseFields = [];
        
        for (let formName in form.Form) {
            const formContent = form.Form[formName];
            if (formContent.fields) {
                responseFields = responseFields.concat(Object.keys(formContent.fields));
            }
        }

        const matchRatio = await evaluateSemanticSimilarity(extractedFields, responseFields);
        return { "Match Ratio (Semantic)": matchRatio };
    } catch (err) {
        console.error("Error during semantic evaluation:", err);
        return { "Match Ratio (Semantic)": 0 };
    }
}

module.exports = { evaluate };

