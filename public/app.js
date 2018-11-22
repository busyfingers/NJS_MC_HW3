/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
const app = {};

// Config
app.config = {
    "sessionToken": false
};

// AJAX Client (for RESTful API)
app.client = {}

app.client.requestAsync = async (headers, path, method, queryStringObject, payload) => {

    // Set defaults
    headers = typeof (headers) == "object" && headers !== null ? headers : {};
    path = typeof (path) == "string" ? path : "/";
    method = typeof (method) == "string" && ["POST", "GET", "PUT", "DELETE"].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : "GET";
    queryStringObject = typeof (queryStringObject) == "object" && queryStringObject !== null ? queryStringObject : {};
    payload = typeof (payload) == "object" && payload !== null ? payload : {};

    // For each query string parameter sent, add it to the path
    let requestUrl = path + "?";
    let counter = 0;
    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // If at least one query string parameter has already been added, preprend new ones with an ampersand
            if (counter > 1) {
                requestUrl += "&";
            }
            // Add the key and value
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    // Form the http request as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-type", "application/json");

    // For each header sent, add it to the request
    Object.keys(headers).forEach(headerKey => {
        xhr.setRequestHeader(headerKey, headers[headerKey]);
    });

    // If there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    // Wrap the ready event in a promise and wait for it at the end of this function
    let request = new Promise((resolve, reject) => {
        // When the request comes back, handle the response
        xhr.onreadystatechange = _ => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                let statusCode = xhr.status;
                let responseReturned = xhr.responseText;

                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    resolve({ statusCode, "responsePayload": parsedResponse });
                } catch (e) {
                    reject({ statusCode, "error": e });
                }
            }
        }
    });

    // Send the payload as JSON
    let payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
    return await request;
}

// Bind the logout button
app.bindLogoutButton = function () {
    document.getElementById("logoutButton").addEventListener("click", function (e) {
        // Stop it from redirecting anywhere
        e.preventDefault();

        // Log the user out
        app.logUserOut();
    });
};

// Log the user out then redirect them
app.logUserOut = async redirectUser => {
    // Set redirectUser to default to true
    redirectUser = typeof (redirectUser) == "boolean" ? redirectUser : true;

    // Get the current token id
    const tokenId = typeof (app.config.sessionToken.id) == "string" ? app.config.sessionToken.id : false;

    // Send the current token to the tokens endpoint to delete it
    const queryStringObject = {
        "id": tokenId
    };
    await app.client.requestAsync(undefined, "api/tokens", "DELETE", queryStringObject);
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if (redirectUser) {
        window.location = "/session/deleted";
    }
};

// Bind the forms
app.bindForms = function () {
    if (document.querySelector("form")) {
        const allForms = document.querySelectorAll("form");
        for (let i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener("submit", async function (e) {
                // Stop it from submitting
                e.preventDefault();
                const formId = this.id;
                const path = this.action;
                let method = this.method.toUpperCase();

                // Hide the error message (if it"s currently shown due to a previous error)
                document.querySelector("#" + formId + " .formError").style.display = "none";

                // Hide the success message (if it"s currently shown due to a previous error)
                if (document.querySelector("#" + formId + " .formSuccess")) {
                    document.querySelector("#" + formId + " .formSuccess").style.display = "none";
                }

                // Turn the inputs into a payload
                const payload = {};
                const elements = this.elements;
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].type !== "submit") {
                        // Determine class of element and set value accordingly
                        const classOfElement = typeof (elements[i].classList.value) == "string" && elements[i].classList.value.length > 0 ? elements[i].classList.value : "";
                        const valueOfElement = elements[i].type == "checkbox" && classOfElement.indexOf("multiselect") == -1 ? elements[i].checked : classOfElement.indexOf("intval") == -1 ? elements[i].value : parseInt(elements[i].value);
                        const elementIsChecked = elements[i].checked;
                        // Override the method of the form if the input"s name is _method
                        let nameOfElement = elements[i].name;
                        if (nameOfElement == "_method") {
                            method = valueOfElement;
                        } else {
                            // Create an payload field named "method" if the elements name is actually httpmethod
                            if (nameOfElement == "httpmethod") {
                                nameOfElement = "method";
                            }
                            // Create an payload field named "id" if the elements name is actually uid
                            if (nameOfElement == "uid") {
                                nameOfElement = "id";
                            }
                            // If the element has the class "multiselect" add its value(s) as array elements
                            if (classOfElement.indexOf("multiselect") > -1) {
                                if (elementIsChecked) {
                                    payload[nameOfElement] = typeof (payload[nameOfElement]) == "object" && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }
                        }
                    }
                }

                // If the method is DELETE, the payload should be a queryStringObject instead
                const queryStringObject = method == "DELETE" ? payload : {};

                // Display "loading" message if available
                app.toggleLoadingMessage("block");

                // Call the API
                const { statusCode, responsePayload } = await app.client.requestAsync(undefined, path, method, queryStringObject, payload);

                // Display an error on the form if needed
                if (statusCode !== 200) {
                    if (statusCode == 403) {
                        // log the user out
                        app.logUserOut();
                    } else {
                        // Try to get the error from the api, or set a default error message
                        const error = typeof (responsePayload.error) == "string" ? responsePayload.error : "An error has occured, please try again";

                        // Set the formError field with the error text
                        document.querySelector("#" + formId + " .formError").innerHTML = error;

                        // Show (unhide) the form error field on the form
                        document.querySelector("#" + formId + " .formError").style.display = "block";

                        // Handle failed payment, retrieve created order id if available (only for create order page)
                        if (formId === "paymentDetails" && responsePayload.id && document.getElementById("paymentFailedMessage")) {
                            // Hide the payment form and show button link to order details
                            document.getElementById("paymentDetails").style.display = "none";
                            document.getElementById("paymentFailedMessage").style.display = "block";
                            document.getElementById("retryPaymentCTA").style.display = "block";
                            document.getElementById("retryPayment").href = "/order/details?id=" + responsePayload.id;
                        }
                        app.toggleLoadingMessage("none");
                    }
                } else {
                    // If successful, send to form response processor
                    app.formResponseProcessor(formId, payload, responsePayload);
                }
            });
        }
    }
};

app.toggleLoadingMessage = displayValue => {
    const loadingMessage = document.getElementById("loadingMessage");
    if (loadingMessage) {
        loadingMessage.style.display = displayValue;
    }
}

app.displayFormErrorMessage = formId => {
    // Set the formError field with the error text
    document.querySelector("#" + formId + " .formError").innerHTML = "Sorry, an error has occured. Please try again.";

    // Show (unhide) the form error field on the form
    document.querySelector("#" + formId + " .formError").style.display = "block";
}

// Form response processor
app.formResponseProcessor = async (formId, requestPayload, responsePayload) => {
    // If account creation was successful, try to immediately log the user in
    if (formId == "accountCreate") {
        // Take the email and password, and use it to log the user in
        const newPayload = {
            "email": requestPayload.email,
            "password": requestPayload.password
        };

        const { statusCode: newStatusCode, responsePayload: newResponsePayload } = await app.client.requestAsync(undefined, "api/tokens", "POST", undefined, newPayload);

        if (newStatusCode !== 200) {
            // Display an error on the form if needed
            app.displayFormErrorMessage(formId);
        } else {
            // If successful, set the token and create a cart for the user
            app.setSessionToken(newResponsePayload);

            const payload = { "email": requestPayload.email };
            const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/carts", "POST", undefined, payload);

            if (statusCode !== 200) {
                // Display an error on the form if needed
                app.displayFormErrorMessage(formId);
            } else {
                // If OK, redirect to "My Orders"
                window.location = "/orders/all";
            }
        }
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId == "sessionCreate") {
        app.setSessionToken(responsePayload);
        window.location = "/orders/all";
    }

    // If forms saved successfully and they have success messages, show them
    const formsWithSuccessMessages = ["accountEdit1", "accountEdit2"];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector("#" + formId + " .formSuccess").style.display = "block";
    }

    // If the user just deleted their account, redirect them to the account-delete page
    if (formId == "accountEdit3") {
        app.logUserOut(false);
        window.location = "/account/deleted";
    }

    // If the user placed an order, redirect to confirmation page
    if (formId == "paymentDetails") {
        window.location = "/order/confirmed";
    }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = _ => {
    const tokenString = localStorage.getItem("token");
    if (typeof (tokenString) == "string") {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (token) == "object") {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = add => {
    const target = document.querySelector("body");
    if (add) {
        target.classList.add("loggedIn");
    } else {
        target.classList.remove("loggedIn");
    }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = token => {
    app.config.sessionToken = token;
    const tokenString = JSON.stringify(token);
    localStorage.setItem("token", tokenString);
    if (typeof (token) == "object") {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false);
    }
};

// Renew the token
app.renewToken = async () => {
    const currentToken = typeof (app.config.sessionToken) == "object" ? app.config.sessionToken : false;
    if (currentToken) {
        // Update the token with a new expiration
        const payload = {
            "id": currentToken.id,
            "extend": true,
        };
        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/tokens", "PUT", undefined, payload);
        // Display an error on the form if needed
        if (statusCode == 200) {
            // Get the new token details
            const queryStringObject = { "id": currentToken.id };
            const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/tokens", "GET", queryStringObject, undefined);
            // Display an error on the form if needed
            if (statusCode == 200) {
                app.setSessionToken(responsePayload);
                return true;
            } else {
                app.setSessionToken(false);
                return false;
            }
        } else {
            app.setSessionToken(false);
            return false;
        }
    } else {
        app.setSessionToken(false);
        return false;
    }
};

// Load data on the page
app.loadDataOnPage = _ => {
    // Get the current page from the body class
    const bodyClasses = document.querySelector("body").classList;
    const primaryClass = typeof (bodyClasses[0]) == "string" ? bodyClasses[0] : false;

    // Logic for login page
    if (primaryClass == "sessionCreate") {
        app.loadLoginPage();
    }

    // Logic for account settings page
    if (primaryClass == "accountEdit") {
        app.loadAccountEditPage();
    }

    // Logic for My Orders page
    if (primaryClass == "ordersList") {
        app.loadOrdersListPage();
    }
    // Logic for menu
    if (primaryClass == "menuList") {
        app.loadMenuListPage();
    }

    // Logic for cart
    if (primaryClass == "cartView") {
        app.loadCartViewPage();
    }

    // Logic for creating order
    if (primaryClass == "orderCreate") {
        app.loadOrderCreatePage();
    }

    // Logic for viewing an order
    if (primaryClass == "orderDetails") {
        app.loadOrderDetailsPage();
    }
};

// Auto redirect user if already logged in
app.loadLoginPage = () => {
    if (app.config.sessionToken) {
        window.location = "/orders/all";
    }
}

// Load the account edit page specifically
app.loadAccountEditPage = async () => {
    // Get the email from the current token, or log the user out if none is there
    const email = typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        const queryStringObject = {
            "email": email
        };

        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, 'api/users', 'GET', queryStringObject, undefined);
        if (statusCode == 200) {
            // Put the data into the forms as values where needed
            document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
            document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
            document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.email;
            document.querySelector("#accountEdit1 .streetAddressInput").value = responsePayload.streetAddress;

            // Put the hidden phone field into both forms
            const hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput");
            for (let i = 0; i < hiddenEmailInputs.length; i++) {
                hiddenEmailInputs[i].value = responsePayload.email;
            }
        } else {
            // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
            app.logUserOut();
        }
        
    } else {
        app.logUserOut();
    }
};

// Load the My Orders page specifically
app.loadOrdersListPage = async () => {
    // Get the email from the current token, or log the user out if none is there
    const email = typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        const queryStringObject = {
            "email": email
        };
        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/users", "GET", queryStringObject, undefined);
        
        if (statusCode == 200) {
            // Determine how many orders the user has
            const allOrders = typeof (responsePayload.orders) == "object" && responsePayload.orders instanceof Array && responsePayload.orders.length > 0 ? responsePayload.orders : [];

            if (allOrders.length > 0) {
                // Show each placed order as a new row in the table
                allOrders.forEach(async orderId => {
                    // Get the data for the order
                    const newQueryStringObject = {
                        "id": orderId
                    };
                    const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/orders", "GET", newQueryStringObject, undefined);
                    
                    if (statusCode == 200) {
                        // Make the order data into a table row
                        const table = document.getElementById("ordersListTable");
                        const tr = table.insertRow(-1);
                        tr.classList.add("orderRow");
                        const td0 = tr.insertCell(0);
                        const td1 = tr.insertCell(1);
                        const td2 = tr.insertCell(2);
                        const td3 = tr.insertCell(3);
                        td0.innerHTML = responsePayload.orderPlacedAt;
                        td1.innerHTML = responsePayload.totalAmount;
                        td2.innerHTML = responsePayload.paymentStatus;
                        td3.innerHTML = `<a href="/order/details?id=${responsePayload.id}">Details</a>`;
                    } else {
                        console.log("Error trying to load order ID: ", orderId);
                    }
                });
            } else {
                // Show "you have no orders" message
                document.getElementById("noOrdersMessage").style.display = "table-row";
                // Show the goToMenu CTA
                document.getElementById("goToMenuCTA").style.display = "block";
            }
        } else {
            // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
            app.logUserOut();
        }
    } else {
        app.logUserOut();
    }
};

// Load the place order page specifically
app.loadOrderCreatePage = async () => {
    // Get the email from the current token, or log the user out if none is there
    const email = typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        const queryStringObject = {
            "email": email
        };
        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/users", "GET", queryStringObject, undefined);
        
        if (statusCode == 200) {
            // Put the user data into the form as values where needed
            document.querySelector("#customerDetails .displayFirstNameInput").value = responsePayload.firstName;
            document.querySelector("#customerDetails .displayLastNameInput").value = responsePayload.lastName;
            document.querySelector("#customerDetails .displayEmailInput").value = responsePayload.email;
            document.querySelector("#customerDetails .displayStreetAddressInput").value = responsePayload.streetAddress;

            const cartId = typeof (responsePayload.cart) == "string" && responsePayload.cart.length > 0 ? responsePayload.cart : "";

            // Put the cartId the hidden form field
            document.querySelector("input.hiddenCartId").value = cartId;

            // Get the cart items
            app.loadCartItems(cartId, false);
        } else {
            // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
            app.logUserOut();
        }
    } else {
        app.logUserOut();
    }
}

// Load the order details page
app.loadOrderDetailsPage = async () => {
    // Get the order id from the query string, if none is found then redirect back to My Orders
    const id = typeof (window.location.href.split("=")[1]) == "string" && window.location.href.split("=")[1].length > 0 ? window.location.href.split("=")[1] : false;
    if (id) {
        // Fetch the order data
        const queryStringObject = {
            "id": id
        };
        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/orders", "GET", queryStringObject);

        if (statusCode == 200) {
            // Load order items
            const orderItems = responsePayload.orderItems;
            const itemNames = Object.keys(orderItems);
            if (itemNames.length > 0) {
                const table = document.getElementById("orderItemsTable");
                itemNames.forEach(itemName => {
                    // Make the cart data into a table row      
                    const tr = table.insertRow(-1);
                    tr.classList.add("orderItemRow");
                    const td0 = tr.insertCell(0);
                    const td1 = tr.insertCell(1);
                    const td2 = tr.insertCell(2);
                    td0.innerHTML = itemName;
                    td1.innerHTML = orderItems[itemName].quantity;
                    td2.innerHTML = orderItems[itemName].amount;
                });
                table.insertRow(-1).insertCell(0).innerHTML = `Total amount: ${responsePayload.totalAmount}`;
            }

            // Put the user data into the form as values where needed
            document.querySelector("#customerDetails .displayRecipientInput").value = responsePayload.recipient;
            document.querySelector("#customerDetails .displayPlacedAtInput").value = responsePayload.orderPlacedAt;
            document.querySelector("#customerDetails .displayEmailInput").value = responsePayload.email;
            document.querySelector("#customerDetails .displayStreetAddressInput").value = responsePayload.streetAddress;
            document.getElementById("paymentStatus").innerHTML = responsePayload.paymentStatus;
            document.querySelector("input.hiddenOrderId").value = responsePayload.id;

            if (responsePayload.paymentStatus !== "Paid") {
                document.getElementById("paymentStatus").style.background = "#b30202";
            } else {
                document.getElementById("paymentStatus").style.background = "#007e2a";
                // Hide payment form if the order is already paid
                document.getElementById("paymentDetails").style.display = "none";
            }
        } else {
            // If the request comes back as something other than 200, redirect back to My Orders
            window.location = "/orders/all";
        }
    } else {
        window.location = "/orders/all";
    }
}

// Load the Menu page specifically
app.loadMenuListPage = async () => {

    // Hide the error message (if it's currently shown due to a previous error)
    if (document.querySelector(".addError")) {
        document.querySelector(".addError").style.display = "none";
    }

    // Hide the success message (if it's currently shown due to a previous error)
    if (document.querySelector(".addSuccess")) {
        document.querySelector(".addSuccess").style.display = "none";
    }

    // Get the email from the current token, or log the user out if none is there
    const email = typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        const queryStringObject = {
            "email": email
        };
        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/users", "GET", queryStringObject, undefined);

        if (statusCode == 200) {
            const cartId = typeof (responsePayload.cart) == "string" && responsePayload.cart.length > 0 ? responsePayload.cart : "";
            const { statusCode, responsePayload: menuResponsePayload } = await app.client.requestAsync(undefined, "api/menu", "GET", undefined, undefined);
            
            if (statusCode == 200) {                  
                const menuItems = typeof (menuResponsePayload) == "object" ? menuResponsePayload : {};
                const itemNames = Object.keys(menuItems);
                
                // Make sure that the menu isn't empty
                if (itemNames.length > 0) {
                    // Show each placed order as a new row in the table
                    itemNames.forEach(itemName => {
                        // Put each menu item into a single row
                        const table = document.getElementById("menuListTable");
                        const tr = table.insertRow(-1);
                        tr.classList.add("menuRow");
                        const td0 = tr.insertCell(0);
                        const td1 = tr.insertCell(1);
                        const td2 = tr.insertCell(2);
                        const td3 = tr.insertCell(3);
                        td0.innerHTML = itemName;
                        td1.innerHTML = menuItems[itemName];
                        td2.innerHTML = `<input id="MI${itemName.replace(/ /g, "")}" type="number" value="1"></input>`;
                        td2.style.width = "5%";
                        td2.style.paddingLeft = "5px";
                        td3.innerHTML = `<div onclick="app.addToCart('${cartId}', '${itemName}', 'MI${itemName.replace(/ /g, "")}')" class="ctaWrapper ctaSmall">Add to cart</div>`
                    });
                }
            } else {
                // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        } else {
            // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
            app.logUserOut();
        }
    } else {
        app.logUserOut();
    }
};

// Load the Cart page specifically
app.loadCartViewPage = async () => {
    // Hide the error message (if it's currently shown due to a previous error)
    if (document.querySelector(".addError")) {
        document.querySelector(".addError").style.display = "none";
    }

    // Hide the success message (if it's currently shown due to a previous error)
    if (document.querySelector(".addSuccess")) {
        document.querySelector(".addSuccess").style.display = "none";
    }

    // Get the email from the current token, or log the user out if none is there
    const email = typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        const queryStringObject = {
            'email': email
        };
        const { statusCode, responsePayload } = await app.client.requestAsync(undefined, 'api/users', 'GET', queryStringObject, undefined);
        if (statusCode == 200) {
            // Get the user's cart id
            const cartId = typeof (responsePayload.cart) == 'string' && responsePayload.cart.length > 0 ? responsePayload.cart : '';

            if (cartId) {
                app.loadCartItems(cartId);
            } else {
                document.getElementById("cartErrorMessage").style.display = "block";
            }
        } else {
            // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
            app.logUserOut();
        }
    } else {
        app.logUserOut();
    }
};

// Add an item to the cart
app.addToCart = async (cartId, item, quantity) => {
    let updateCart = true;
    if (typeof (quantity) === "string") {
        // In this case the item was added from the menu and the argument is the name of the input field. Lookup the input field and grab the value.
        quantity = parseInt(document.getElementById(quantity).value);
        // Only reload cart if the user is at that page
        updateCart = false;
    }

    const itemObj = { [item]: quantity };

    const payload = {
        "id": cartId,
        "items": itemObj
    };

    const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/carts", "put", undefined, payload);
    if (statusCode == 200) {
        if (updateCart) {
            location.reload();
        } else {
            document.querySelector(".addSuccess").style.display = "block";
        }
    } else {
        document.querySelector(".addError").style.display = "block";
        console.log("Error adding item to cart: ", statusCode, responsePayload);
    }
}

// Get cart items and build a table with the containing items
app.loadCartItems = async (cartId, displayButtons) => {
    // Optionally show the add/remove buttons, default to true
    displayButtons = typeof (displayButtons) === "boolean" ? displayButtons : true;
    // Get the data for the cart
    const newQueryStringObject = {
        "id": cartId
    };
    const { statusCode, responsePayload } = await app.client.requestAsync(undefined, "api/carts", "GET", newQueryStringObject, undefined);
    if (statusCode == 200) {
        const cartItems = responsePayload.items;
        const itemNames = Object.keys(cartItems);
        if (itemNames.length > 0) {
            const table = document.getElementById("cartViewTable");
            itemNames.forEach(itemName => {
                // Make the cart data into a table row      
                const tr = table.insertRow(-1);
                tr.classList.add("cartItemRow");
                const td0 = tr.insertCell(0);
                const td1 = tr.insertCell(1);
                const td2 = tr.insertCell(2);
                const td3 = tr.insertCell(3);
                const td4 = tr.insertCell(4);
                const td5 = tr.insertCell(5);
                td0.innerHTML = itemName;
                td1.innerHTML = cartItems[itemName].quantity;
                td2.innerHTML = cartItems[itemName].amount;
                if (displayButtons) {
                    td3.innerHTML = `<div onclick="app.addToCart('${cartId}', '${itemName}', 1)" class="ctaWrapper ctaSmall">+</div>`;
                    td4.innerHTML = `<div onclick="app.addToCart('${cartId}', '${itemName}', -1)" class="ctaWrapper ctaSmall">-</div>`;
                    td5.innerHTML = `<div onclick="app.addToCart('${cartId}', '${itemName}', 0)" class="ctaWrapper ctaSmall">Remove</div>`;
                }
            });
            const td = table.insertRow(-1).insertCell(0);
            td.innerHTML = `Total amount: ${responsePayload.totalAmount}`;

            // Show the createOrder CTA
            const createOrderButton = document.getElementById("createOrderCTA");
            if (createOrderButton) {
                createOrderButton.style.display = "block";
            }

        } else {
            // Show "you have no items in cart" message
            const noItemsMsg = document.getElementById("noCartItemsMessage");
            if (noItemsMsg) {
                noItemsMsg.style.display = "table-row";
            }
            // Show the goToMenu CTA
            const goToMenuCta = document.getElementById("goToMenuCTA");
            if (goToMenuCta) {
                goToMenuCta.style.display = "block";
            }
        }
    } else {
        console.log("Error trying to load cart ID: ", cartId);
    }
}

// Loop to renew token often
app.tokenRenewalLoop = function () {
    setInterval(async _ => {
        const renewed = await app.renewToken();
        if (renewed) {
            console.log("Token renewed successfully @ " + Date.now());
        }
    }, 1000 * 60);
};

// Init (bootstrapping)
app.init = function () {

    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();
};

// Call the init processes after the window loads
window.onload = function () {
    app.init();
};
