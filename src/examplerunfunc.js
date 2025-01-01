const { getValidationResults, calculateConfidenceScores, calculateSemanticMatchRatio } = require('./index');

const jsonOutput = {
  "Form": {
    "Letter of Agreement / Affidavit of Parental Consent": {
      "fields": {
        "Child's Name": {
          "widget": "TEXT"
        },
        "Cell Number #": {
          "widget": "TEXT"
        },
        "Address": {
          "widget": "PARAGRAPH_TEXT"
        },
        "State": {
          "widget": "TEXT"
        },
        "Zip": {
          "widget": "TEXT"
        }
      }
    },
    "For Travel Outside the United States of a Minor Child Without Parents Traveling": {
      "subtitle": "I understand that my child will be traveling to Barcelona, Spain, on March 29th, 2024 (date of travel). Aboard American Airlines Flight # AA 0066, and on April 5th, American Airlines Flight # AA 0067. Flight # AA 0006 departs JFK Airport at 7:40 PM, and on April 5th, Flight # AA 0067 departs Barcelona at 12:50 PM arriving at JFK Airport at 2:30 PM with Coach Bill Rich, and other accompanying Coaches, adults'/parent chaperones. Their expected date of return is April 5th, 2024.",
      "fields": {
        "Parent's Name": {
          "widget": "TEXT"
        },
        "Parent's Signature": {
          "widget": "SIGNATURE"
        },
        "Witness Name": {
          "widget": "TEXT"
        },
        "Witness Signature": {
          "widget": "SIGNATURE"
        }
      }
    }
  }};
const logprobs ={
  "tokens": [
    "\"Form\"", "{",
    "\"Letter of Agreement / Affidavit of Parental Consent\"", "{",
    "\"fields\"", "{",
    "\"Child's Name\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
    "\"Cell Number #\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
    "\"Address\"", "{", "\"widget\"", ":", "\"PARAGRAPH_TEXT\"", "}",
    "\"State\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
    "\"Zip\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
    "}",
    "}",
    "\"For Travel Outside the United States of a Minor Child Without Parents Traveling\"", "{",
    "\"subtitle\"", ":", "\"I understand that my child will be traveling to Barcelona, Spain, on March 29th, 2024...\"",
    "\"fields\"", "{",
    "\"Parent's Name\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
    "\"Parent's Signature\"", "{", "\"widget\"", ":", "\"SIGNATURE\"", "}",
    "\"Witness Name\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
    "\"Witness Signature\"", "{", "\"widget\"", ":", "\"SIGNATURE\"", "}",
    "}",
    "}"
  ],
  "token_logprobs": [-0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5]
};
const document = `"# Letter of Agreement

## Affidavit of Parental Consent

For Travel Outside the United States of a Minor Child Without Parents Traveling

I \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ understand that my child

**(Parent's Name)**

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ will be traveling to

**(Child's Name)**

Destination – Barcelona, Spain, on March 29th, 2024 (date of travel). Aboard American Airlines Flight # AA 0066, and on April 5th, American Airlines Flight # AA 0067. Flight # AA 0066 departs JFK Airport at 7:40 PM, and on April 5th, Flight # AA 0067 departs Barcelona at 12:50 PM arriving at JFK Airport at 2:30 PM with Coach Bill Rich, and other accompanying Coaches, adults'/parent chaperones. Their expected date of return is April 5th, 2024.

Signed: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Parent(s) Signature(s) Parent(s) Signature(s)

Address \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ State\_\_\_\_\_\_\_ Zip\_\_\_\_\_\_\_\_\_\_\_\_

Cell Number # \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Witness Name \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
Witness Signature \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_"`
; 

async function main() {
  try {
    const validationResults = await getValidationResults(jsonOutput, logprobs, document);
    
    console.log("Confidence Scores:", JSON.stringify(validationResults.confidenceScores, null, 2));
    console.log("Semantic Match Ratio:", validationResults.matchRatio["Match Ratio (Semantic)"]);
  } catch (error) {
    console.error("Error in validation:", error);
  }
}
main();
