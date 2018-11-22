/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");
const response = helpers.createHandlerResponse; // For shorter statements where this is used

// The handlers object
let handlers = {};

// Returns a suitable main handling function for a given route
// Caller specifies the acceptable HTTP methods and which functions ("submethods") to map them against
handlers.mainHandler = (subMethodContainer, acceptableMethods) => {
    return data => {
        return new Promise((resolve, reject) => {
            if (acceptableMethods.indexOf(data.method) > -1) {
                // Expect the handler sub methods to return an object with the following keys-values:
                // "statusCode": <number>
                // "payload": <object>
                // - "payload" contains the key "error" if an error occured
                // "contentType": <string>
                handlers[subMethodContainer][data.method](data).then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
            } else {
                reject(response(405, { "error": `Invalid method: ${data.method}` }));
            }
        });
    };
}

/**
 * Handlers for HTML
 */

// Index handler
handlers.index = data => {
    return new Promise((resolve, reject) => {
        if (data.method === "get") {
            // Prepare data for interpolation
            let templateData = {
                "head.title": "Papa's Pizza Palace",
                "head.description": "We deliver delicous pizza from our authentic Italian stone oven.",
                "body.class": "index"
            };
            // Read in a template as a string
            helpers.getTemplate("index", templateData).then(strData => {
                return helpers.addUniversalTemplates(strData, templateData);
            }).then(strData => {
                resolve(response(200, strData, "html"));
            }).catch(err => {
                reject(err);
            });

        } else {
            reject(response(405, undefined, "html"));
        }
    });
};

// Create Account handler
handlers.accountCreate = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            let templateData = {
                'head.title': 'Create an Account',
                'head.description': 'Signup is easy and only takes a few seconds.',
                'body.class': 'accountCreate'
            };

            // Get the template with header and footer
            helpers.getCompletePage("accountCreate", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }
    });
}

// Create New Session handler
handlers.sessionCreate = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            let templateData = {
                "head.title": "Login to your account.",
                "head.description": "Please enter your phone number and password to access your account.",
                "body.class": "sessionCreate"
            };

            // Get the template with header and footer
            helpers.getCompletePage("sessionCreate", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }
    });
}

// Edit Your Account handler
handlers.accountEdit = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'Account Settings',
                'body.class': 'accountEdit'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("accountEdit", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }
    });
};

// Account has been deleted
handlers.accountDeleted = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if(data.method == "get"){
            // Prepare data for interpolation
            let templateData = {
                "head.title" : "Account deleted",
                "head.description" : "Your account has been deleted",
                "body.class" : "accountDeleted"
            };
    
            // Get the template with header and footer
            helpers.getCompletePage("accountDeleted", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
            
        } else {
            reject(response(405, undefined, "html"));
        }
    });   
}

// Session has been deleted
handlers.sessionDeleted = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if(data.method == "get"){
            // Prepare data for interpolation
            let templateData = {
                "head.title" : "Logged Out",
                "head.description" : "You have been logged out of your account.",
                "body.class" : "sessionDeleted"
            };
    
            // Get the template with header and footer
            helpers.getCompletePage("sessionDeleted", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
            
        } else {
            reject(response(405, undefined, "html"));
        }
    });
};

// My Orders Handler
handlers.ordersList = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'My Orders',
                'body.class': 'ordersList'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("ordersList", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }
    });
};

// Create Order handler
handlers.orderCreate = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'Place order',
                'body.class': 'orderCreate'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("orderCreate", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }        
    });
}

// Order confirmed handler
handlers.orderConfirmed = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'Order confirmed!',
                'body.class': 'orderConfirmed'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("orderConfirmed", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }        
    });
}

// Order details handler
handlers.orderDetails = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'Order details',
                'body.class': 'orderDetails'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("orderDetails", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }        
    });
}

// Menu handler
handlers.menuList = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'Menu',
                'body.class': 'menuList'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("menuList", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }
    });
};

// Cart handler
handlers.cartView = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == "get") {
            // Prepare data for interpolation
            const templateData = {
                'head.title': 'Cart',
                'body.class': 'cartView'
            };
            
            // Get the template with header and footer
            helpers.getCompletePage("cartView", templateData).then(page => {
                resolve(response(200, page, "html"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405, undefined, "html"));
        }
    });
};

// Favicon handler
handlers.favicon = data => {
    return new Promise((resolve, reject) => {
        // Reject any request that isn't a GET
        if (data.method == 'get') {
            // Read in the favicon's data
            helpers.getStaticAsset("favicon.ico").then(favicon => {
                resolve(response(200, favicon, "favicon"));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(405));
        }
    });
};

// Public assets
handlers.public = data => {
    return new Promise((resolve, reject) => {
        if (data.method === "get") {
            // Determine the requested file name
            let assetName = data.trimmedPath.replace("public/", "").trim();
            if (assetName.length > 0) {
                // Retrieve the asset data
                helpers.getStaticAsset(assetName).then(data => {
                    // Determine the content type (default to plain text)
                    let contentType = 'plain';

                    if (assetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (assetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (assetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (assetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    resolve(response(200, data, contentType));
                }).catch(err => {
                    reject(err);
                })
            } else {
                reject(response(404));
            }
        } else {
            reject(respone(405));
        }
    });
}

/**
 * Handlers for the JSON API
 */

// -----------------------------
// Handler methods for: /users
// -----------------------------

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, email, streetAddress, password, tosAgreement
// Optional data: none
handlers._users.post = data => {
    // Check that all the required field are filled out
    let firstName = typeof (data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof (data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let email = typeof (data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    let streetAddress = typeof (data.payload.streetAddress) == "string" && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
    let password = typeof (data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof (data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

    return new Promise((resolve, reject) => {
        if (firstName && lastName && email && streetAddress && password && tosAgreement) {
            // Make sure that the user doesn't already exist
            _data.read("users", email).then(_ => {
                throw (response(400, { "error": "A user with that email already exists" }));
            }).catch(err => {
                if (err.statusCode === 400) { // Re-throw if error was thrown above
                    throw err;
                }

                // Hash the password and proceed if there are no errors doing so
                let hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create the user object
                    let user = {
                        "firstName": firstName,
                        "lastName": lastName,
                        "email": email,
                        "streetAddress": streetAddress,
                        "hashedPassword": hashedPassword,
                        "tosAgreement": true
                    };

                    // Store the user
                    return _data.create("users", email, user);
                } else {
                    throw (response(500, { "error": "Could not hash the user's password" }));
                }
            }).then(_ => {
                resolve(response(200));
            }).catch(err => {
                reject(err);
            })
        } else {
            reject(response(400, { "error": "Missing required fields" }));
        }
    });
}

// Users - get
// Required data: email
// Optional data: none
handlers._users.get = data => {
    // Check that the email is valid
    let email = typeof (data.queryStringObject.email) == "string" && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    return new Promise((resolve, reject) => {
        if (email) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Verify that the given token is valid for the email
            handlers._tokens.verifyToken(token, email).then(_ => {
                // Everything OK, continue on to the next "then" in the promise chain
                return Promise.resolve();
            }).catch(_ => {
                throw (response(403, { "error": "Missing required token in header or token is invalid" }));
            }).then(_ => {
                // Lookup the user
                return _data.read("users", email);
            }).catch(err => {
                if (err.statusCode === 500) { // The error originated from _data.read()
                    throw (response(404, { "error": "User not found" }));
                } else { // Rethrow if the error did not originate from _data.read()
                    throw err;
                }
            }).then(userData => {
                // Remove the hashed password from the user object before returning it to the requester
                delete userData.hashedPassword;
                resolve(response(200, userData));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "error": "Missing required field" }));
        }
    });
};

// Users - put
// Required data: email
// Optional data: firstName, lastName, streetAddress, password (at least one must be specified)
handlers._users.put = data => {
    // Check for the required field
    let email = typeof (data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

    // Check for the optional fields
    let firstName = typeof (data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof (data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let streetAddress = typeof (data.payload.streetAddress) == "string" && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
    let password = typeof (data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    return new Promise((resolve, reject) => {
        // Error if the email is invalid in all cases
        if (email) {
            // Error if nothing is sent to update
            if (firstName || lastName || streetAddress || password) {
                // Get the token from the headers
                let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
                // Verify that the given token is valid for the email
                handlers._tokens.verifyToken(token, email).then(_ => {
                    // Everything OK, continue on to the next "then" in the promise chain
                    return Promise.resolve();
                }).catch(_ => {
                    throw (response(403, { "error": "Missing required token in header or token is invalid" }));
                }).then(_ => {
                    // Lookup the user
                    return _data.read("users", email);
                }).then(userData => {
                    // Update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (streetAddress) {
                        userData.streetAddress = streetAddress;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Done, continue on to the next "then" in the promise chain
                    return Promise.resolve(userData);
                }).catch(err => {
                    if (err.statusCode === 500) { // if the error originated from _data.read()
                        throw (response(400, { "error": "The specified user does not exist" }));
                    } else {
                        throw err; // Rethrow if the error did not originate from _data.read()
                    }
                }).then(userData => {
                    // Store the new update
                    return _data.update("users", email, userData);
                }).then(_ => {
                    resolve(response(200));
                }).catch(err => {
                    reject(err);
                });
            } else {
                reject(response(400, { "error": "Missing field to update" }));
            }
        } else {
            reject(response(400, { "error": "Missing required field" }));
        }
    });
}

// Users - delete
// Requied field: email
handlers._users.delete = data => {
    // Check that the email is valid
    let email = typeof (data.queryStringObject.email) == "string" && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    return new Promise((resolve, reject) => {
        if (email) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Verify that the given token is valid for the email
            handlers._tokens.verifyToken(token, email).then(_ => {
                return Promise.resolve();
            }).catch(_ => {
                throw (response(403, { "error": "Missing required token in header or token is invalid" }));
            }).then(_ => {
                // Lookup the user
                return _data.read("users", email);
            }).catch(err => {
                if (err.statusCode === 500) { // if the error originated from _data.read()
                    throw (response(400, { "error": "Could not find the specified user" }));
                } else {
                    throw err; // Rethrow if the error did not originate from _data.read()
                }
            }).then(userData => {
                // Delete data related to the user, orders etc.
                return handlers.deleteRelatedResources(userData.cart, userData.orders);
            }).then(_ => {
                // Delete the user
                return _data.delete("users", email);
            }).then(_ => {
                resolve(response(200));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "Error": "Missing required field" }));
        }
    });
}

// Main handler for /users
// Returns a status code and an object representing the handler return data
handlers.users = handlers.mainHandler("_users", ["post", "get", "put", "delete"]);

// -----------------------------
// Handler methods for: /tokens
// -----------------------------

// Container for all the tokens submethods
handlers._tokens = {};

// Main handler for /tokens
// Returns a status code and an object representing the handler return data
handlers.tokens = handlers.mainHandler("_tokens", ["post", "get", "put", "delete"]);

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data) => {
    let email = typeof (data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    let password = typeof (data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tokenObject = {};

    return new Promise((resolve, reject) => {
        if (email && password) {
            // Lookup the user who matches the email
            _data.read("users", email).then(userData => {
                // Hash the sent password and compare it to the password stored in the user object
                let hashedPassword = helpers.hash(password);

                if (hashedPassword == userData.hashedPassword) {
                    // If valid, create new token with random name. Set expiration date 1 hour in the future
                    return {
                        "email": email,
                        "id": helpers.createRandomString(20),
                        "expires": Date.now() + 1000 * 60 * 60
                    };
                } else {
                    throw (response(400, { "error": "Password did not match the specified user's stored password" }));
                }
            }).catch(err => {
                if (err.statusCode == 500 && err.payload.syscall == "open" && err.payload.code == "ENOENT") {
                    // In this case, the error was thrown by _data.read()
                    throw (response(404, { "error": "User not found" }));
                } else {
                    throw err;
                }
            }).then(tokenData => {
                // Assign tokenData to variable in function scope so that it is accessible further down the promise chain              
                tokenObject = tokenData;
                // Store the token
                return _data.create("tokens", tokenData.id, tokenData);
            }).then(_ => {
                resolve(response(200, tokenObject));
            }).catch(err => {
                reject(err);
            });
        }
    });
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = data => {
    // Check that the id is valid
    let id = typeof (data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    return new Promise((resolve, reject) => {
        if (id) {
            // Lookup the token
            _data.read("tokens", id).then(tokenData => {
                resolve(response(200, tokenData));
            }).catch(_ => {
                reject(response(404));
            });
        } else {
            reject(response(400, { "Error": "Missing required field" }));
        }
    });
}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = data => {
    let id = typeof (data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let extend = typeof (data.payload.extend) == "boolean" && data.payload.extend == true ? true : false;

    return new Promise((resolve, reject) => {
        if (id && extend) {
            // Lookup the token
            _data.read("tokens", id).then(tokenData => {
                // Make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration one hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new updates
                    return _data.update("tokens", id, tokenData);
                } else {
                    throw (response(400, { "error": "The token has already expired and cannot be extended" }));
                }
            }).then(_ => {
                resolve(response(200));
            }).catch(err => {
                if (err.statusCode == 500 && err.payload.syscall == "open" && err.payload.code == "ENOENT") {
                    // In this case, the error was thrown by _data.read()
                    reject(response(400, { "error": "Specified token does not exist" }));
                } else {
                    reject(err);
                }
            });
        } else {
            reject(response(400, { "error": "Missing required field(s) or fields are invalid" }));
        }
    })
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = data => {
    // Check that the id is valid
    let id = typeof (data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    return new Promise((resolve, reject) => {
        if (id) {
            // Lookup the user
            _data.read("tokens", id).then(_ => {
                return _data.delete("tokens", id);
            }).then(_ => {
                resolve(response(200));
            }).catch(err => {
                if (err.statusCode == 500) {
                    if (err.payload.syscall == "open" && err.payload.code == "ENOENT") {
                        // In this case, the error was thrown by _data.read()
                        reject(response(400, { "error": "Could not find the specified token" }));
                    }
                    else {
                        // In this case, the error was thrown by _data.delete
                        reject(response(500, { "error": "Could not delete the specified token" }));
                    }
                } else {
                    reject(err);
                }
            });
        } else {
            reject(response(400, { "error": "Missing required field" }));
        }
    })
};

// -----------------------------
// Handler methods for: /menu
// -----------------------------

// Container for all the menu submethods
handlers._menu = {};

// Main handler for /menu
// Returns a status code and an object representing the handler return data
handlers.menu = handlers.mainHandler("_menu", ["get"]);

// Menu - get
// Required data: email (user needs to be logged in)
// Optional data: none
handlers._menu.get = data => {
    return new Promise((resolve, reject) => {
        // Get the token from the headers
        let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token).then(_ => {
            // Everything OK, continue on to the next "then" in the promise chain
            return Promise.resolve();
        }).catch(_ => {
            throw (response(403, { "error": "Missing required token in header or token is invalid" }));
        }).then(_ => {
            return _data.menu;
        }).then(menu => {
            resolve(response(200, menu));
        }).catch(err => {
            reject(err);
        });
    });
}

// -----------------------------
// Handler methods for: /carts
// -----------------------------

// Container for all the carts submethods
handlers._carts = {};

// Main handler for /carts
// Returns a status code and an object representing the handler return data
handlers.carts = handlers.mainHandler("_carts", ["post", "get", "put"]);

// Cart - Post
// Creates a new cart for the user (this should be done as part of the user registration)
// Required data: email
// Optional data: none
handlers._carts.post = data => {
    // Verify email
    let email = typeof (data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    let cartId = "";
    let userData = {};

    return new Promise((resolve, reject) => {
        if (email) {
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Verify that the given token is valid for the email
            handlers._tokens.verifyToken(token, email).then(_ => {
                // Everything OK, continue on to the next "then" in the promise chain
                return Promise.resolve();
            }).catch(_ => {
                throw (response(403, { "error": "Missing required token in header or token is invalid" }));
            }).then(_ => {
                // Get the user's data
                return _data.read("users", email);
            }).catch(err => {
                if (err.statusCode == 500 && err.payload.syscall == "open" && err.payload.code == "ENOENT") {
                    // The error originated from _data.read()
                    throw (response(400, { "error": "User not found" }));
                } else {
                    throw err;
                }
            }).then(data => {
                userData = data;
                if (!userData.cart) {
                    // User does not have a cart - proceed
                    return Promise.resolve();
                } else {
                    // User already has a cart - error
                    throw (response(400, { "error": "The specified user already has a cart" }));
                }
            }).then(_ => {
                // Create the cart
                cartId = helpers.createRandomString(20);
                let cart = {
                    "id": cartId,
                    "email": email,
                    "items": {},
                    "totalAmount": ""
                }
                return _data.create("carts", cartId, cart);
            }).then(_ => {
                userData["cart"] = cartId;
                // Update the user with the cart Id 
                return _data.update("users", email, userData);
            }).then(_ => {
                resolve(response(200, { "id": cartId }));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "error": "Missing required field" }));
        }
    });
}

// Cart - Put
// Adds or removes menu items to the cart
// Required data: id, item(s)
// Optional data: none
handlers._carts.put = data => {
    // Verify required fields
    // let email = typeof (data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    let id = typeof (data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let items = helpers.validateItems(data.payload.items, _data.menu) ? data.payload.items : false;
    let cartData = {};

    return new Promise((resolve, reject) => {
        if (id && items) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Make sure the token match the user the cart belongs to and return the cart data
            handlers.validateOnResource("carts", id, token).then(_cartData => {
                // Assign retrieved data to variable in function scope 
                cartData = _cartData;

                let totalAmount = cartData.totalAmount === "" ? 0 : parseInt(cartData.totalAmount.replace("$", ""));

                Object.keys(items).forEach(key => {
                    let quantityChange = items[key];
                    let price = parseInt(_data.menu[key].replace("$", ""));

                    if (cartData.items[key] !== undefined) {
                        // THe item already exist in the cart, update the quantity, amount and total amount accordingly
                        let oldQuantity = cartData.items[key].quantity;
                        let newQuantity = oldQuantity+quantityChange;
                        if (quantityChange === 0 || newQuantity <= 0) {
                            // Remove if quantity sent is 0 or is decreased to or below 0
                            totalAmount -= price * oldQuantity;
                            delete cartData.items[key];
                        } else {
                            totalAmount += price * quantityChange;
                            cartData.items[key] = { "quantity": newQuantity, "amount": `$${price * newQuantity}` };                         
                        }
                    } else {
                        // The item does not exist in the cart. Make sure the quantity is >0 and add the item (i.e. do not add 0-quantity items)
                        if (quantityChange > 0) {
                            totalAmount += price * quantityChange;
                            cartData.items[key] = { "quantity": quantityChange, "amount": `$${price * quantityChange}` };                 
                        }
                    }
                });
                // Update the cart with the total amount
                cartData.totalAmount = `$${totalAmount}`;

                // Store the updated cart
                return _data.update("carts", cartData.id, cartData);
            }).then(_ => {
                resolve(response(200));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "error": "Required field is missing or invalid" }));
        }
    });
}

// Carts - get
// Required data: id
// Optional data: none
handlers._carts.get = data => {
    // Check required field
    let id = typeof (data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    return new Promise((resolve, reject) => {
        if (id) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Make sure the token match the user the cart belongs to and return the cart data
            handlers.validateOnResource("carts", id, token).then(cartData => {
                // Unless the cart is empty, add price information
                resolve(response(200, cartData));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "error": "Invalid or missing cart id" }));
        }
    })
}

// -----------------------------
// Handler methods for: /orders
// -----------------------------

// Container for all the orders submethods
handlers._orders = {};

// Main handler for /orders
// Returns a status code and an object representing the handler return data
handlers.orders = handlers.mainHandler("_orders", ["post", "get", "put", "delete"]);

// Orders - post
// Required data: cartId
// Optional data: none
handlers._orders.post = data => {
    // Verify required field
    let cartId = typeof (data.payload.cartId) == "string" && data.payload.cartId.trim().length == 20 ? data.payload.cartId.trim() : false;
    let cardNumber = !isNaN(parseInt(data.payload.cardNumber)) ? helpers.validateCardNumber(parseInt(data.payload.cardNumber)) : false;
    let orderId = "";
    let cartData = {};
    let orderData = {};
    let userData = {};

    return new Promise((resolve, reject) => {
        if (cartId && cardNumber) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Make sure the token match the user the cart belongs to and return the cart data
            handlers.validateOnResource("carts", cartId, token).then(_cartData => {
                // Assign retrieved data to variable in function scope 
                cartData = _cartData;
                // Make sure there are items in the cart
                if (Object.keys(cartData.items).length > 0) {
                    return Promise.resolve();
                } else {
                    throw (response(400, { "error": "Cannot place an order from an empty cart" }));
                }
            }).then(_ => {
                // Lookup the user
                return _data.read("users", cartData.email);
            }).then(_userData => {
                userData = _userData;
                // Create the order, before payment in case there is some problem processing the payment
                orderId = helpers.createRandomString(20);
                orderData = {
                    "id": orderId,
                    "recipient": `${userData.firstName} ${userData.lastName}`,
                    "streetAddress": userData.streetAddress,
                    "email": userData.email,
                    "orderItems": cartData.items,
                    "totalAmount": cartData.totalAmount,
                    "orderPlacedAt": Date.now(),
                    "paymentStatus": "Unpaid"
                };
                // Store the order
                return _data.create("orders", orderId, orderData);
            }).then(_ => {
                // Add the order id to the user
                let userOrders = typeof (userData.orders) == "object" && userData.orders instanceof Array ? userData.orders : [];
                userOrders.push(orderData.id);
                userData.orders = userOrders;
                return _data.update("users", userData.email, userData);
            }).then(_ => {
                // Clear the items from the cart
                cartData.items = {};
                cartData.totalAmount = "";
                return _data.update("carts", cartId, cartData);
            }).then(_ => {
                // Process payment
                if (cardNumber === "failure_test") {
                    throw (response(400, { "error": "Payment failed" }));
                }
                return helpers.sendPayment(cardNumber, orderData.totalAmount, orderData.email);
            }).then(_ => {
                // Update payment status on the order
                orderData.paymentStatus = "Paid";
                return _data.update("orders", orderData.id, orderData);
            }).then(_ => {
                // Notify user by email
                let message = "Order summary:\n------------\n";
                Object.keys(orderData.orderItems).forEach(key => {
                    message += `${orderData.orderItems[key].quantity} x ${key} = ${orderData.orderItems[key].amount}\n`;
                });
                message += `\nTotal amount: ${orderData.totalAmount}`;

                return helpers.sendConfirmationEmail(orderData.email, message);
            }).then(_ => {
                resolve(response(200, orderData));
            }).catch(err => {
                // Return the id of the created order (if any)
                if (orderId) {
                    err.payload.id = orderId;    
                }
                reject(err);
            })
        } else {
            reject(response(400, { "error": "Invalid or missing required field" }));
        }
    })
}

// Orders - get
// Required data: orderId
// Optional data: none
handlers._orders.get = data => {
    // Verify required field
    let id = typeof (data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    let orderData = {};

    return new Promise((resolve, reject) => {
        if (id) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Make sure the token match the specified order and return the order data
            handlers.validateOnResource("orders", id, token).then(orderData => {
                resolve(response(200, orderData));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "error": "Invalid or missing order id" }));
        }
    });
}

// Orders - put
// Required data: id, paymentStatus
// Optional data:
handlers._orders.put = data => {
    // Verify required field
    let id = typeof (data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let paymentStatus = typeof (data.payload.paymentStatus) == "string" && ["Paid", "Unpaid"].indexOf(data.payload.paymentStatus) > -1 ? data.payload.paymentStatus : false;
    let cardNumber = !isNaN(parseInt(data.payload.cardNumber)) ? helpers.validateCardNumber(parseInt(data.payload.cardNumber)) : false;
    let orderData = {};

    return new Promise((resolve, reject) => {
        if (id && paymentStatus && cardNumber) {
            // Get the token from the headers
            let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Make sure the token match the specified order and return the order data
            handlers.validateOnResource("orders", id, token).then(_orderData => {
                // Assign to variable in function scope
                orderData = _orderData;

                if (paymentStatus !== orderData.paymentStatus) {
                    orderData.paymentStatus = paymentStatus;
                    if (paymentStatus === "Paid") {
                        // Try to make the payment
                        return helpers.sendPayment(cardNumber, orderData.totalAmount, orderData.email);
                    } else {
                        return Promise.resolve();
                    }
                } else {
                    throw (response(400, { "error": "No data was changed" }))
                }
            }).then(_ => {
                // Store the update
                return _data.update("orders", id, orderData);
            }).then(_ => {
                // Only send email if the status was changed to "Paid"
                if (paymentStatus === "Paid") {
                    // Notify user by email
                    let message = "Order summary:\n------------\n";
                    Object.keys(orderData.orderItems).forEach(key => {
                        message += `${orderData.orderItems[key].quantity} x ${key} = ${orderData.orderItems[key].amount}\n`;
                    });
                    message += `\nTotal amount: ${orderData.totalAmount}`;

                    return helpers.sendConfirmationEmail(orderData.email, message);
                } else {
                    return Promise.resolve();
                }
            }).then(_ => {
                resolve(response(200));
            }).catch(err => {
                reject(err);
            });
        } else {
            reject(response(400, { "error": "Invalid or missing required field" }));
        }
    });
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, email) => {
    return new Promise((resolve, reject) => {
        // Lookup the token
        _data.read("tokens", id).then(tokenData => {
            if (email) {
                // If an email was provided, check that the token is for the given user and has not expired
                if (tokenData.email == email && tokenData.expires > Date.now()) {
                    resolve();
                } else {
                    console.log("email mismatch: ", tokenData.email, email)
                    reject(response(403, { "error": "Missing required token in header or token is invalid" }));
                }
            } else {
                // Only make sure the token has not expired
                if (tokenData.expires > Date.now()) {
                    resolve();
                } else {
                    reject(response(403, { "error": "Missing required token in header or token is invalid" }));
                }
            }
        }).catch(_ => {
            // If tokenData is falsy above, we will end up here
            reject(response(403, { "error": "Missing required token in header or token is invalid" }));
        });
    });
}

handlers.deleteRelatedResources = (cartId, orders) => {
    orders = typeof(orders) !== "undefined" ? orders : [];
    // Define all deletion work to be done (i.e. assign the promises from the delete function to an array)
    let deletions = [_data.delete("carts", cartId)];
    orders.forEach(orderId => {
        deletions.push(_data.delete("orders", orderId));
    });

    return new Promise((resolve, reject) => {
        // Run all deletions and resolve when finished
        Promise.all(deletions).then(_ => {
            resolve(response(200));
        }).catch(err => {
            reject(err);
        })
    });
}

handlers.validateOnResource = (resource, resourceId, token) => {
    let resourceData = {};
    return new Promise((resolve, reject) => {
        // Lookup the specified order
        _data.read(resource, resourceId).then(_resourceData => {
            // Assign retrieved data to variable in function scope 
            resourceData = _resourceData;
            // Get the token from the headers
            // let token = typeof (data.headers.token) == "string" ? data.headers.token : false;
            // Verify that the given token is valid for the email
            return handlers._tokens.verifyToken(token, resource["email"]);
        }).then(_ => {
            resolve(resourceData);
        }).catch(err => {
            if (err.statusCode === 500) {
                reject(response(404, { "error": `${resource} object not found` }));
            } else {
                reject(err);
            }
        });
    });
}

// Not found handler
handlers.notFound = () => {
    return new Promise((resolve, reject) => {
        reject(response(400, { "error": "Invalid route" }));
    })
}

// Export the handlers
module.exports = handlers;