/**
 * Helper functions for various tasks
 */

// Dependencies
const crypto = require("crypto");
const config = require("./config");
const fs = require("fs");
const https = require("https");
const querystring = require("querystring");
const util = require("util");
const debug = util.debuglog("helpers");
const path = require("path");

// Promisified versions of standard functions
const fsReadFile = util.promisify(fs.readFile);

// Container for the module (to be exported)
let lib = {};

// Create necessary folders on startup, if needed
lib.createRequiredFolders = () => {
    config.folderPaths.forEach(path => {
        if (!fs.existsSync(path)) fs.mkdirSync(path);
    });
}

// Parse a JSON string to an object and in all cases, without throwing
lib.parseJsonToObject = str => {
    try {
        return JSON.parse(str);
    } catch (error) {
        return {};
    }
}

// Create a SHA256 hashed string
lib.hash = str => {
    if (typeof (str) === "string" && str.length > 0) {
        return crypto.createHmac("sha256", config.hashingSecret).update(str).digest("hex");
    } else {
        return false;
    }
}

// Create a handler response
lib.createHandlerResponse = (statusCode, payload, contentType) => {
    // Default to empty object if function was called without a payload argument
    payload = typeof(payload) !== "undefined" ? payload : {};
    // Default to JSON if no content type was specified
    contentType = typeof(contentType) !== "undefined" ? contentType : "json";
    return {"statusCode": statusCode, "payload": payload, "contentType": contentType};
}

// Create a string of random alphanumeric characters of a given length
lib.createRandomString = strLength => {
    strLength = typeof(strLength) == "number" && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define all the possible characters that could go into a string
        let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

        // Start the final string
        let str = "";

        for (let i = 1; i <= strLength; i++) {
            // Append random character to final string
            str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        }

        return str;

    } else {
        return false;
    }
};

// Make sure all item counts in an item collection object is >= 0 and that they are real menu items
lib.validateItems = (items, menu) => {
    let menuItems = Object.keys(menu);
    let validationStatus = true;

    if (typeof(items) == "object") {
        let keys = Object.keys(items);
        // Make sure the object has at least one key
        if (keys.length < 1) {
            validationStatus = false;
        }
        keys.forEach(key => {
            // Make sure the items are actually on the menu
            if (menuItems.indexOf(key) == -1) {
                validationStatus = false;
            }
            // Make sure the amount is a number and is zero or greater
            if (typeof(items[key]) !== "number") {
                validationStatus = false;
            }
        });
    } else {
        validationStatus = false;
    }

    return validationStatus
}

// Helper function to make a http request
lib.sendRequest = (requestData, requestOptions) => {
    return new Promise((resolve, reject) => {
        // Instantiate the request object
        let req = https.request(requestOptions, res => {
            // Bind to the data event and collect the incoming stream
            let chunks = [];
            res.on("data", chunk => {
                chunks.push(chunk);
            });

            // Bind to the end event and process the results from the request
            res.on("end", _ => {
                let body = lib.parseJsonToObject(Buffer.concat(chunks));
                debug(`Request to external API responded with: ${body.message === undefined ? "" : body.message}`);
                // Grab the status of the sent request
                let status = res.statusCode;
                // Callback successfully if the request went through
                if (status == 200 || status == 201) {
                    resolve(lib.createHandlerResponse(200));
                } else {
                    reject(lib.createHandlerResponse(status, {"error": body.message}));
                }
            });
        });

        // Bind to the error event so it doesn't get thrown
        req.on("error", err => {
            reject(lib.createHandlerResponse(500, err));
        });

        // Add the data to the request
        req.write(requestData);

        // End the request
        req.end();
    });
}

// Send a confirmation email via Mailgun
lib.sendConfirmationEmail = (recipient_email, content) => {
    return new Promise((resolve, reject) => {
        let requestData = querystring.stringify({
            "from": config.mailgun.from,
            "to": recipient_email,
            "subject": "Your order is confirmed!",
            "text": `Your pizza order is confirmed!\n\n${content}\n\nHave a nice day!`
        });

        let requestOptions = {
            "protocol": "https:",
            "hostname": "api.mailgun.net",
            "method": "POST",
            "path": `/v3/${config.mailgun.domain}/messages`,
            "headers": {
                "Authorization": `Basic ${Buffer.from("api:"+config.mailgun.apiKey).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(requestData)
            }
        };

        lib.sendRequest(requestData, requestOptions).then(confirmed => {
            resolve(confirmed);
        }).catch(err => {
            err.payload.error = `Could not send email, status code: ${err.statusCode}`;
            err.statusCode = 500;
            reject(err);
        })
    });
};

// Make sure the provided card number is a Stripe testing number
lib.validateCardNumber = cardNumber => {
    const validNumbers = {
        4242424242424242 : "tok_visa",
        4000056655665556 : "tok_visa_debit",
        5555555555554444 : "tok_mastercard",
        5200828282828210 : "tok_mastercard_debit",
        5105105105105100 : "tok_mastercard_prepaid",
        378282246310005 : "tok_amex",
        371449635398431 : "tok_amex",
        6011111111111117 : "tok_discover",
        0909090909090909 : "failure_test"
    }; 

    return typeof(validNumbers[cardNumber]) !== "undefined" ? validNumbers[cardNumber] : false;
}

// Send a create payment request to Stripe
lib.sendPayment = (cardNumber, amount, email) => {
    return new Promise((resolve, reject) => {
        let requestData = querystring.stringify({
            "amount": parseInt(amount.replace("$","") * 100), // The amount in cents
            "currency": config.stripe.currency,
            "source": cardNumber,
            "receipt_email": email
        });

        let requestOptions = {
            "protocol": "https:",
            "hostname": "api.stripe.com",
            "method": "POST",
            "path": "/v1/charges",
            "headers": {
                "Authorization": `Basic ${Buffer.from(config.stripe.apiKey).toString("base64")}`,
                "Content-Type" : "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(requestData)
            }
        };

        lib.sendRequest(requestData, requestOptions).then(confirmed => {
            resolve(confirmed);
        }).catch(err => {
            err.payload.error = `Could not process payment, status code: ${err.statusCode}`;
            // err.statusCode = 400;
            reject(err);
        })
    });
}

// Take a given string and data object, and find/replace all the keys within it
lib.interpolate = (str, data) => {
    str = typeof(str) == "string" && str.length > 0 ? str : "";
    data = typeof(data) == "object" && data !== null ? data : {};
  
    // Add the templateGlobals to the data object, prepending their key name with "global."
    Object.keys(config.templateGlobals).forEach(key => {
        data[`global.${key}`] = config.templateGlobals[key];
    });

    // For each key in the data object, insert its value into the string at the corresponding placeholder
    Object.keys(data).forEach(key => {
        if (typeof(data[key] == "string")) {
            str = str.replace(`{${key}}`, data[key]);
        }
        
    });
    
    return str;
};

// Get the string content of a template, and use provided data for string interpolation
lib.getTemplate = (templateName, data) => {
    templateName = typeof(templateName) == "string" && templateName.length > 0 ? templateName : false;
    data = typeof(data) == "object" && data !== null ? data : {};

    return new Promise((resolve, reject) => {
        if (templateName) {
            let templatesDir = path.join(__dirname,"/../templates/");
            
            fsReadFile(`${templatesDir}${templateName}.html`, "utf8").then(htmlStr => {
                resolve(lib.interpolate(htmlStr, data));
            }).catch(err => {
                reject(lib.createHandlerResponse(500, err, "html"));
            });
          } else {
            reject(response(400, {"error" : "A valid template name was not specified"}));
          }
    });
}

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
lib.addUniversalTemplates = (str, data) => {
    str = typeof(str) == "string" && str.length > 0 ? str : "";
    data = typeof(data) == "object" && data !== null ? data : {};
    let header = "";

    return new Promise((resolve, reject) => {
        // Get the header
        lib.getTemplate("_header", data).then(headerStr => {
            header = headerStr;
            return lib.getTemplate("_footer");
        }).then(footerStr => {
            resolve(header + str + footerStr);
        }).catch(err => {
            reject(lib.createHandlerResponse(500, err, "html"));
        });
    });
};

// Get the contents of a static (public) asset
lib.getStaticAsset = fileName => {
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
    return new Promise((resolve, reject) => {
        if (fileName) {
            let publicDir = path.join(__dirname,'/../public/');

            fsReadFile(publicDir + fileName).then(data => {
                resolve(data);
            }).catch(err => {
                reject(lib.createHandlerResponse(404, {"error": "File not found"}));
            });
          } else {
            reject(lib.createHandlerResponse(400, {"error": "Specified file name is invalid"}));
          }
    })
}

lib.getCompletePage = (templateName, templateData) => {
    return new Promise((resolve, reject) => {
        lib.getTemplate(templateName, templateData).then(str => {
            return lib.addUniversalTemplates(str, templateData);
        }).then(str => {
            resolve(str);
        }).catch(err => {
            reject(err);
        });
    });
}

// Export the module
module.exports = lib;