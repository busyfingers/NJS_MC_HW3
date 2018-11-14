/**
 * Library for storing and editing data
 */

// Dependencies
const util = require("util");
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");
const response = helpers.createHandlerResponse; // For shorter statements where this is used
const config = require("./config");

// Promisified versions of standard functions
const fsOpen = util.promisify(fs.open);
const fsWriteFile = util.promisify(fs.writeFile);
const fsClose = util.promisify(fs.close);
const fsReadFile = util.promisify(fs.readFile);
const fsTruncate = util.promisify(fs.truncate);
const fsUnlink = util.promisify(fs.unlink);
const fsReaddir = util.promisify(fs.readdir);

// Container for the module (to be exported)
let lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = (dir, file, data) => {
    // Declare variable in function scope to hold file descriptior value so that it
    // is available in the entire promise chain
    let fileDescriptor = 0;

    return new Promise((resolve, reject) => {
        fsOpen(`${lib.baseDir}${dir}/${file}.json`, "wx").then(fd => {
            // Assign file descriptor value
            fileDescriptor = fd;

            // Convert data to string
            let stringData = JSON.stringify(data);
            
            // Write to the file
            return fsWriteFile(fileDescriptor, stringData);
        }).then(_ => {
            // Close the file
            return fsClose(fileDescriptor);
        }).then(_ => {
            resolve(fileDescriptor); // Everything OK - resolve promise
        }).catch(err => {
            reject(response(500, err));
        });
    });
}

// Read data from a file
lib.read = (dir, file) => {
    return new Promise((resolve, reject) => {
        fsReadFile(`${lib.baseDir}${dir}/${file}.json`, "utf-8").then(data => {
            // Return the file data (and resolve the promise)
            resolve(helpers.parseJsonToObject(data));
        }).catch(err => {
            reject(response(500, err));
        });
    });
}

// Update data inside a file
lib.update = (dir, file, data) => {
    // Declare variables in function scope to hold file descriptior value and 
    // string data so that they are available in the entire promise chain
    let fileDescriptor = 0;
    let stringData = "";

    return new Promise((resolve, reject) => {
        fsOpen(`${lib.baseDir}${dir}/${file}.json`, "r+").then(fd => {
            // Assign file descriptor value
            fileDescriptor = fd;

            // Convert data to string
            stringData = JSON.stringify(data);

            // Truncate the file
            return fsTruncate(fileDescriptor);
        }).then(_ => {
            // Write new data to the file
            return fsWriteFile(fileDescriptor, stringData);
        }).then(_ => {
            // Close the file
            return fsClose(fileDescriptor);
        }).then(_ => {
            resolve(); // Everything OK - resolve promise
        }).catch(err => {
            reject(response(500, err));
        });
    });   
}

// Delete a file
lib.delete = (dir, file) => {
    return new Promise((resolve, reject) => {
        // Unlink the file
        fsUnlink(`${lib.baseDir}${dir}/${file}.json`).then(() => {
            resolve(); // Everything OK - resolve promise
        }).catch(err => {
            reject(response(500, err));
        });
    });
};

// List all the items in a directory
lib.list = (dir) => {
    return new Promise((resolve, reject) => {
        fsReaddir(`${lib.baseDir}${dir}/`).then(files => {
            let trimmedFileNames = [];

            files.forEach(fileName => {
                trimmedFileNames.push(fileName.replace(".json", ""));
            });

            resolve(trimmedFileNames);
        }).catch(err => {
            reject(response(500, err));
        });
    });
};

// Retrieve the menu and store in memory
lib.menu = {};
lib.getMenuItems = () => {
    return new Promise((resolve, reject) => {
        lib.read("menu", "menu").then(menuItems => {
            lib.menu = menuItems;
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
};

// Read HTTPS cert and key files
lib.getHttpsCertAndKey = () => {
    config.httpsKey = fs.readFileSync(path.join(__dirname, "/../.https/key.pem"));
    config.httpsCert = fs.readFileSync(path.join(__dirname, "/../.https/cert.pem"))
};

// Export the module
module.exports = lib;