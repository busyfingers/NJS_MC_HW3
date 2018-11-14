/**
 * Primary file of the REST API
 */

// Dependencies
const bootstrap = require("./lib/bootstrap");
const server = require("./lib/server");

// Declare the app
let app = {};

// Init function
app.init = () => {
    // Bootstrap the server
    bootstrap.do().then(_ => {
        // Start the server
        server.init();
    }).catch(err => {
        // Explode if we get here because then something is wrong
        throw err;
    })
};

// Execute
app.init();

// Export the app
module.exports = app;