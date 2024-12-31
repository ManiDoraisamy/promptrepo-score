// const tf = require('@tensorflow/tfjs-node');
// const use = require('@tensorflow-models/universal-sentence-encoder');

// async function testModelLoading() {
//     try {
//         console.log("Loading model...");
//         const model = await use.load();
//         console.log("Model loaded successfully.");
//     } catch (error) {
//         console.error("Error loading model:", error);
//     }
// }

// testModelLoading();

const { calculateConfidenceScores, calculateSemanticMatchRatio } = require('./index');

const jsonOutput = {
  "Form": {
    "Vendor Registration": {
      "subtitle": "This registration form to be completed by any person or company requesting payment from Edmond Public Schools. This includes: reimbursements, refunds, payments for goods and/or services, etc.",
      "fields": {
        "Name": {
          "help": "As shown on your income tax return",
          "widget": "TEXT"
        },
        "Business Name": {
          "help": "Disregarded entity name (if different from above)",
          "widget": "TEXT"
        },
        "Federal Tax Classification": {
          "help": "Select the appropriate answer",
          "widget": "MULTIPLE_CHOICE",
          "choices": [
            "Individual / Sole proprietor",
            "Partnership",
            "Trust / Estate",
            "C Corporation",
            "S Corporation",
            "Limited liability company"
          ]
        },
        "Address": {
          "help": "number, street, apt or suite no. / city, state, zip code",
          "widget": "PARAGRAPH_TEXT"
        }
      }
    },
    "Tax Payer Identification (TIN)": {
      "subtitle": "Enter your TIN. The TIN provided must match the name given on \"Vendor name\" to avoid backup withholding. For individuals, this is your social security number (SSN). For other entities, it is your employer identification number (EIN).",
      "fields": {
        "Social security number (SSN)": {
          "widget": "TEXT"
        },
        "Employer identification number (EIN)": {
          "widget": "TEXT"
        }
      }
    },
    "Vendor questionnaire": {
      "fields": {
        "Under what former name(s) has your business operated under during the past 7 years?": {
          "widget": "PARAGRAPH_TEXT"
        },
        "Are you or any principal or partner of this business a current employee of Edmonton Public Schools or a relative of any employee or Edmonton Board of Education member?": {
          "widget": "MULTIPLE_CHOICE",
          "choices": [
            "Yes",
            "No"
          ]
        },
        "If yes, please specify relationship": {
          "widget": "TEXT"
        },
        "Are you currently a retired member of the Oklahoma Teachers Retirement System (OTRS)?": {
          "widget": "MULTIPLE_CHOICE",
          "choices": [
            "Yes",
            "No"
          ]
        },
        "Does your business accept purchase orders?": {
          "widget": "MULTIPLE_CHOICE",
          "choices": [
            "Yes",
            "No"
          ]
        }
      }
    },
    "Purchase order contact information": {
      "fields": {
        "Contact name for orders": {
          "widget": "TEXT"
        },
        "Phone # (PO)": {
          "widget": "TEXT"
        },
        "Mailing address": {
          "help": "number, street, and apt, or suite no. / city, state, zip code",
          "widget": "PARAGRAPH_TEXT"
        },
        "Email address": {
          "help": "To send purchase order",
          "widget": "TEXT"
        },
        "Fax # (PO)": {
          "help": "To send purchase order",
          "widget": "TEXT"
        }
      }
    },
    "Remittance information": {
      "fields": {
        "Name to be printed on check": {
          "widget": "TEXT"
        },
        "Phone # (Remittance)": {
          "widget": "TEXT"
        },
        "Remittance mailing address": {
          "help": "number, street, and apt, or suite no. / city, state, zip code",
          "widget": "PARAGRAPH_TEXT"
        },
        "Accounts receivable contact name": {
          "widget": "TEXT"
        },
        "Accounts receivable contact email": {
          "widget": "TEXT"
        },
        "Fax # (Remittance)": {
          "widget": "TEXT"
        }
      }
    },
    "Certification, Compliance and Agreement": {
      "subtitle": "Under penalties of perjury, I certify that the above information is correct and that:\n\n1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me), and\n2. I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding, and\n3. I am a U.S. citizen or other U.S. person. \n\n\nCertification instructions: You must cross out item 2 above if you have been notified by the IRS that you are currently subject to backup withholding because you have failed to report all interest or dividends on your tax return.\n\nBy signing this vendor application form, you hereby agree to comply with the provisions of Title 70 O.S. $6-101.48 of the Oklahoma Statute incorporated herein by reference, which states that the vendor will not allow any employee of the entity, or of any subcontractor, to perform work or other contracted services on District premises if such employee is or has been convicted in this state, or another state, of any felony offense unless ten (10) years has elapsed, and is not currently registered under the Oklahoma Sex Offenders Registration Act or the Mary Rippy Violent Crime Offenders Act. Upon conviction for any violation of the provisions of this subsection, the violator shall be guilty of a misdemeanor punishable by a fine not to exceed One Thousand Dollars ($1,000.00). In addition, the violator may be liable for civil damages (57 O.S. 589). Vendor acknowledges EPS is a tobacco-free and weapons-free workplace for all schools, buildings and grounds whether leased or owned by the District. The use of tobacco products or possession of a weapon while on any District grounds, in any District buildings, or in any District vehicle is prohibited.\n\nIT IS A VIOLATION OF OKLAHOMA STATE LAW TO PROVIDE ANY GOOD(S) AND/OR SERVICE(S) PRIOR TO THE ISSUANCE OF A VALID PURCHASE ORDER.\n\nThe Internal Revenue Service does not require your consent to any provision of this document other than the certifications required to avoid backup withholding.",
      "fields": {
        "Printer name of US person and vendor representative": {
          "widget": "TEXT"
        },
        "Title": {
          "widget": "TEXT"
        },
        "Signature": {
          "help": "Must be authorized to sign an IRS W-9 form",
          "widget": "SIGNATURE"
        },
        "Date": {
          "widget": "DATE"
        }
      }
    }
  }
}


const logprobs = {
    "tokens": [
      "\"Form\"", "{",
      "\"Photograph & Video Release Form\"", "{",
      "\"fields\"", "{",
      "\"Full Name\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
      "\"Phone\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
      "\"Email address\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
      "\"Fax\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
      "\"Street Address/P.O. Box\"", "{", "\"widget\"", ":", "\"PARAGRAPH_TEXT\"", "}",
      "\"City\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
      "\"Prov/Postal Code/Zip Code\"", "{", "\"widget\"", ":", "\"TEXT\"", "}",
      "}",
      "}",
      "\"Release consent\"", "{",
      "\"subtitle\"", ":", "\"I hereby grant permission to the rights of my image...\"",
      "\"fields\"", "{",
      "\"Signature\"", "{", "\"widget\"", ":", "\"SIGNATURE\"", "}",
      "\"Date\"", "{", "\"widget\"", ":", "\"DATE\"", "}",
      "\"Parent's Signature\"", "{",
      "\"help\"", ":", "\"If this release is obtained...\"",
      "\"widget\"", ":", "\"SIGNATURE\"", "}",
      "}",
      "}",
      "}",
      "\"Key Fields\"", "{",
      "\"email\"", ":", "\"Email address\"",
      "\"name\"", ":", "\"Full Name\"",
      "\"phone\"", ":", "\"Phone\"",
      "}"
    ],
    "token_logprobs": [-0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8]
  }
  ;

const result = calculateConfidenceScores(jsonOutput, logprobs);
console.log("Confidence Scores:", JSON.stringify(result, null, 2));


// Example of calling semantic match ratio function
const document = `"# Vendor Registration Form

Name (as shown on your income tax return):

Business Name (if different from above):

Check appropriate box for federal tax classification:  
 Individual/sole proprietor  
 Partnership  
 C Corporation  
 S Corporation  
 Trust/estate  
 Limited liability company:  
 Other:

Address (number, street, and apt/suite):

City, State, and ZIP Code:

Social Security Number:

Employer Identification Number:

Former Name(s) (if applicable):

Does your business accept purchase orders?

Yes No

### Contact Information

Contact Name for Orders:

Phone Number:

Name to be printed on check:

Phone Number:

Mailing Address:

Remittance Mailing Address:

Email Address to Send Purchase Orders:

Fax Number:

Accounts Receivable Contact Name/Email:

Under penalties of perjury, I certify that the above information is correct and that:

1.  The number shown on this form is my correct taxpayer identification number (TIN), or I am waiting for a number to be issued to me.
2.  I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the IRS that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding.
3.  I am a U.S. citizen or other U.S. person.

Signature:

Date:

### Certification, Compliance, and Agreement

You are responsible for notifying Edmond Public Schools about changes in the above information.

By signing this vendor application form, you agree to comply with the provisions of Title 70 O.S. §6-101.48 of the Oklahoma Statute, which prohibits certain activities on District premises. Please ensure compliance.""`;  // Your document

// Calling calculateSemanticMatchRatio to get the match ratio
calculateSemanticMatchRatio(document, jsonOutput).then(result => {
  console.log("Semantic Match Ratio:", result["Match Ratio (Semantic)"]);
});