/**
 * Create and export confoguration variables
 */

// Container for all the environments
let environments = {};

// Staging object
environments.staging = {
    "httpPort" : 3000,
    "httpsPort" : 3001,
    "httpsKey": "",
    "httpsCert": "",
    "envName" : "staging",
    "hashingSecret" : "This is a secret",
    "folderPaths": ["./.data", "./.data/users", "./.data/tokens", "./.data/carts", "./.data/orders", "./.data/menu", "./.https"],
    "stripe": {
        "currency": "usd",
        "source": "tok_visa",
        "apiKey": typeof (process.env.STRIPE_APIKEY) === "string" ? process.env.STRIPE_APIKEY : ""
    },
    "mailgun" : {
        "apiKey": typeof (process.env.MAILGUN_APIKEY) === "string" ? process.env.MAILGUN_APIKEY : "",
        "domain": typeof (process.env.MAILGUN_DOMAIN) === "string" ? process.env.MAILGUN_DOMAIN : "",
        "from": typeof (process.env.MAILGUN_FROM) === "string" ? process.env.MAILGUN_FROM : ""
    }
};

// Production object
environments.production = {
    "httpPort" : 5000,
    "httpsPort" : 5001,
    "httpsKey": "",
    "httpsCert": "",
    "envName" : "production",
    "hashingSecret" : "This is also a secret",
    "folderPaths": ["./.data/", "./.data/users", "./.data/tokens", "./.data/carts", "./.data/orders", "./.data/menu", "./.https"],
    "stripe": {
        "currency": "usd",
        "source": "",
        "apiKey": typeof (process.env.STRIPE_APIKEY) === "string" ? process.env.STRIPE_APIKEY : ""
    },
    "mailgun" : {
        "apiKey": typeof (process.env.MAILGUN_APIKEY) === "string" ? process.env.MAILGUN_APIKEY : "",
        "domain": typeof (process.env.MAILGUN_DOMAIN) === "string" ? process.env.MAILGUN_DOMAIN : "",
        "from": typeof (process.env.MAILGUN_FROM) === "string" ? process.env.MAILGUN_FROM : ""
    }
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check that the current environment is defined above, if not, default is staging
let environmentToExport = typeof(environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;