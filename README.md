"# salesforce-data-connection" 

Run the following command to create a lead

```javascript

node createlead.js

```

# **Mater Automating Salesforce Data Manipulation with Node.js: A Weekend Project**

Imagine having the power to programmatically set up, manipulate, and retrieve Salesforce data with just a few lines of code. Whether you’re a QA engineer looking to create realistic test data, a developer automating data setup for demos, or a tech-savvy business analyst exploring Salesforce’s vast API capabilities, this guide is for you.

Salesforce is a cornerstone of customer relationship management, but working with its data manually can be time-consuming and prone to errors. Enter Node.js and Salesforce REST APIs—a powerful combination that empowers you to interact with Salesforce programmatically. From creating test SOBJECT, I'll demo the lead SOBJECT, to fetching data for validations, Node.js scripts streamline workflows, reduce manual effort, and enable efficient testing and automation.

In this two-part series, you’ll learn how to build a robust, reusable foundation for interacting with Salesforce data in Part 1. By the end of this article, you’ll have a fully functional setup to programmatically create leads in Salesforce and retrieve their details, ready to be leveraged in Part 2 for writing comprehensive end-to-end tests.

---

## **The Problem: Manual Salesforce Data Management is Painful**
Imagine you’re a QA engineer or developer tasked with testing workflows in Salesforce. You need to create realistic test data, validate it across multiple environments (e.g., Sandbox, Staging, and Production), and ensure consistency. Doing this manually is error-prone and tedious, especially if the workflow involves complex data relationships or large volumes of records.

## **The Solution: Automation with Node.js and Salesforce APIs**
1. **Automated Data Creation**: Programmatically create records in Salesforce with just a script.
2. **Data Retrieval and Validation**: Fetch details of created records to ensure correctness.
3. **Reusable Configuration**: Easily adapt the setup for different environments.
4. **Audit and Debugging**: Save all created data to timestamped files for traceability.

---

## **Why Should You Care?**

Here’s why this project is a game-changer for:

* QA Engineers: Automate test data creation and validation.
* Developers: Reduce setup time for demos and testing.
* Salesforce Admins: Simplify repetitive data management tasks.

Key Benefits:
* Streamline Testing: Say goodbye to manual data entry.
* Save Time: Automate workflows across environments.
* Learn Real-World API Usage: Master authentication, API calls, and data management.
* Build Reusable Foundations: Scale the setup for advanced automation.

---

## **What You’ll learn**

1. How to set up a **free Salesforce Developer Edition** for testing.
2. How to create a **Connected App** to enable secure programmatic access.
3. How to authenticate with Salesforce using the **OAuth2 Username-Password flow**.
4. How to programmatically **create and retrieve Salesforce Leads**.
5. How to use **Node.js libraries** like `axios`, `qs`, `fs`, and `path` to manage data creation, retrieval, and storage.

---

## **Step 1: Set Up a Free Salesforce Developer Edition**

To interact with Salesforce programmatically, you need access to an instance. A **Developer Edition** is a free, fully functional Salesforce environment designed for developers to test, explore, and build applications.

### **Instructions**:
**Sign Up**:
   - Visit the [Salesforce Developer Signup Page](https://developer.salesforce.com/signup).
   - Fill out the form with your details (First Name, Last Name, Email, etc.).
   - Check your email for a verification link, then log in to your new Salesforce Developer Edition.

**Explore Your Environment**:
   - Once logged in, you’ll have access to the Salesforce interface, including Leads, Accounts, and Contacts.
   - This environment comes pre-configured with a small set of sample data, which you can expand or modify.

**Get and save your Security Token**:
You will need this later as part of you REST API call workflow. 

Click the gear icon (⚙️) in the top-right corner and select Setup. Under Setup search for "Reset My Security Token" and click the button [Reset Security Token]. New token will be emailed to you in the email that you used for signing up. It is displayed under Personal Information section. Save this security token somewhere.

---

## **Step 2: Create a Connected App**

A **Connected App** enables external applications to securely connect to Salesforce using OAuth2.

### **Instructions**:
**Navigate to App Manager**:
   - Log in to your Developer Edition.
   - Click the gear icon (⚙️) in the top-right corner and select **Setup**.
   - Search for **App Manager** in the Quick Find box and click it.

**Create a New Connected App**:
   - Click **New Connected App**.
   - Fill out the following:
     - Connected App Name**: `DataConnectApp` (or a name of your choosing)
     - API Name**: Auto-populates
     - Contact Email**: Provide your email. This is where you will receive your security token

**Enable OAuth Settings**:
   - Check **Enable OAuth Settings**.
   - Set the **Callback URL** to `http://localhost:3000` (or your app’s domain; recommended)
     - If the url, after you log into salesforce.com, is https://my-sompany-name.develop.lightning.force.com/whatever
     - then you callback url is one with subdomain: https://my-sompany-name
   - Add these **OAuth Scopes**:
     - `Full Access (full)`.
     - `API (api)`.

**Save and Wait**:
   - Save your app. It may take a few minutes to activate.
   - Note down the **Consumer Key** and **Consumer Secret** for use in the next steps.
     - Under the option: API (Enable OAuth Settings) >> Consumer Key and Secret, click the button [Manage Consumer Details]
	
---

## **Step 3: Start writing code 😊 ; Authentication Code**

The Salesforce OAuth2 **Username-Password Flow** is ideal for programmatic interactions where user intervention is not required. We’ll write a script to authenticate with Salesforce and retrieve an access token. For this we will add a javascript file dataconnect.js

However, to make dataconnect.js more flexible and user-friendly, we can introduce a configuration file. This file will hold placeholders for the OAuth credentials, making it easy for users to update their details without modifying the code.

### **Configuration File: `config.json`**
First, create a configuration file to store your credentials:
```json
{
  "grant_type": "password",
  "client_id": "your_consumer_key",
  "client_secret": "your_consumer_secret",
  "username": "your_salesforce_username",
  "password": "your_salesforce_password + security_token"
}
```
### **Benefits**

- User-Friendly: Simplifies the process of updating credentials.
- Reusable: Configuration file can be reused across projects.
- Error-Proof: Validates input and provides clear feedback for missing fields.

With this enhancement, dataconnect.js becomes a robust and user-friendly utility for authenticating with Salesforce!

### **Authentication Script: `dataconnect.js`**
```javascript
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const path = require('path');

/**
 * Authenticate with Salesforce using OAuth2.
 * @returns {Promise<object>} JSON response containing the access token and instance URL.
 */
const authenticateSalesforce = async () => {
    const configPath = path.resolve(__dirname, 'config.json');

    // Check if the configuration file exists
    if (!fs.existsSync(configPath)) {
        console.error(`Error: Configuration file not found.
		Please create a file named "config.json" in the same directory as this script with the following content:
		{
		  "grant_type": "password",
		  "client_id": "your_client_id_here",
		  "client_secret": "your_client_secret_here",
		  "username": "your_salesforce_username_here",
		  "password": "your_salesforce_password_and_security_token_here"
		}
        `);
        process.exit(1);
    }

    // Read and parse the configuration file
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading configuration file:', error.message);
        process.exit(1);
    }

    // Ensure all required fields are present
    const requiredFields = ['grant_type', 'client_id', 'client_secret', 'username', 'password'];
    for (const field of requiredFields) {
        if (!config[field]) {
            console.error(`Error: Missing required field "${field}" in configuration file.`);
            process.exit(1);
        }
    }

    // Prepare the OAuth request
    const data = qs.stringify(config);
    const requestConfig = {
        method: 'post',
        url: 'https://login.salesforce.com/services/oauth2/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: data
    };

    // Make the request
    try {
        const response = await axios.request(requestConfig);
		const { instance_url, access_token } = response;
        console.log('Authentication successful. access_token recieved.');
        return response.data; // Return the JSON response
    } catch (error) {
        console.error('Authentication failed:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = authenticateSalesforce;

```

---

## **Step 4: Programmatically Create and Retrieve Leads**
In order to not have to change the code file, let us move the fields that define the Lead to a json file that serves as a model for the lead to create. Add whichever fields that can be filled for Lead creation

### **Define Lead Model: `leadModel.json`**
```json

{
  "FirstName": "Orville",
  "LastName": "Wright",
  "Company": "Wright Works",
  "Email": "orville.wright@wilbur.works.com.invalid",
  "Phone": "16725135665",
  "Status": "Open - Not Contacted",
  "Street": "4310 43 Ave",
  "City": "Edmonton",
  "State": "AB",
  "PostalCode": "T6K2V5",
  "Country": "CANADA"
}

```

### **Lead handling Script: 'createlead.js'**

```javascript

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const authenticateSalesforce = require('./dataconnect'); // Import authentication

/**
 * Create a new lead in Salesforce.
 * @param {string} instanceUrl - Salesforce instance URL.
 * @param {string} accessToken - Salesforce access token.
 * @param {object} leadData - Lead data to create.
 * @returns {Promise<object>} - Response from Salesforce containing the lead ID.
 */
const createLead = async (instanceUrl, accessToken, leadData) => {
    const endpoint = `${instanceUrl}/services/data/v57.0/sobjects/Lead`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(endpoint, leadData, { headers });
        console.log('Lead created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating lead:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get details of a lead by ID.
 * @param {string} instanceUrl - Salesforce instance URL.
 * @param {string} accessToken - Salesforce access token.
 * @param {string} leadId - ID of the lead to retrieve.
 * @returns {Promise<object>} - Response containing lead details.
 */
const getLeadDetails = async (instanceUrl, accessToken, leadId) => {
    const endpoint = `${instanceUrl}/services/data/v57.0/sobjects/Lead/${leadId}`;
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    try {
        const response = await axios.get(endpoint, { headers });
        console.log('Lead details retrieved successfully:');
        console.log(JSON.stringify(response.data, null, 2)); // Pretty-print the response
        return response.data;
    } catch (error) {
        console.error('Error retrieving lead details:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Save lead details to a date-time stamped file.
 * @param {object} leadDetails - The lead details to save.
 */
const saveLeadToFile = (leadDetails) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `lead-${timestamp}.json`;
    const filepath = path.resolve(__dirname, filename);

    try {
        fs.writeFileSync(filepath, JSON.stringify(leadDetails, null, 2), 'utf8');
        console.log(`Lead details saved to file: ${filename}`);
    } catch (error) {
        console.error('Error saving lead details to file:', error.message);
    }
};

(async () => {
    try {
        // Step 1: Authenticate with Salesforce
        const authResponse = await authenticateSalesforce();
        const { instance_url, access_token } = authResponse;

        // Step 2: Read lead data from leadModel.json
        const leadModelPath = path.resolve(__dirname, 'leadModel.json');
        if (!fs.existsSync(leadModelPath)) {
            console.error('Error: leadModel.json not found. Please create the file with lead data.');
            process.exit(1);
        }

        const leadData = JSON.parse(fs.readFileSync(leadModelPath, 'utf8'));

        // Step 3: Create the lead
        const createResponse = await createLead(instance_url, access_token, leadData);
        const leadId = createResponse.id;

        // Step 4: Retrieve the created lead's details
        const leadDetails = await getLeadDetails(instance_url, access_token, leadId);

        // Step 5: Save lead details to a date-time stamped file
        saveLeadToFile(leadDetails);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

```

## **How to run the code**

Once you clone this repository cd to the directory, then run the following command
```javascript
node createlead.js

```

---

## **Final Output**
1. **Console**:
   - Authentication success.
   - Lead creation confirmation with the ID.
   - Pretty-printed lead details.

2. **File Output**:
   - A JSON file named `lead-YYYY-MM-DDTHH-MM-SS.json` containing the lead’s details.


### **Summary**

This implementation ensures:
1. **Dynamic Input**: Lead creation data is sourced from a JSON model, making it easy to update.
2. **Comprehensive Workflow**: Includes lead creation, retrieval, and saving details for audit or testing purposes.
3. **User-Friendly**: Provides clear error messages and guidance if files are missing or misconfigured.

---

## **Libraries Used in the Project**
#### Here’s a detailed explanation of the purpose and use of all the libraries used in the project, as well as why their methods are used and their advantages:

### **1. Axios**
- **Purpose**:
  - Axios is a promise-based HTTP client for Node.js and the browser.
  - It simplifies making HTTP requests and handling their responses.

- **Where It’s Used**:
  - **In `dataconnect.js`**: To authenticate with Salesforce by sending an HTTP POST request to the OAuth2 token endpoint.
  - **In `createlead.js`**: To send HTTP POST and GET requests for creating and retrieving Salesforce Leads.

- **Key Methods Used**:
  - **`axios.post(url, data, config)`**:
    - Used to send data (e.g., OAuth credentials or Lead data) to a specified endpoint.
    - Example in `dataconnect.js`:
      ```javascript
      axios.post('https://login.salesforce.com/services/oauth2/token', data, config);
      ```
    - **Advantage**: Axios automatically serializes the data for JSON or form-encoded payloads, making it easy to send complex data structures.

  - **`axios.get(url, config)`**:
    - Used to retrieve details of a created Lead.
    - Example in `createlead.js`:
      ```javascript
      axios.get(`${instanceUrl}/services/data/v57.0/sobjects/Lead/${leadId}`, { headers });
      ```
    - **Advantage**: Simplifies adding custom headers (like `Authorization`) to requests.

  - **Error Handling**:
    - Axios provides built-in support for handling HTTP errors.
    - Example:
      ```javascript
      .catch((error) => {
          console.error('Error:', error.response?.data || error.message);
      });
      ```
    - **Advantage**: Easy access to error details (status codes, response body, etc.).

---

### **2. qs**
- **Purpose**:
  - `qs` is a library for parsing and stringifying query strings.
  - It helps serialize data into the `application/x-www-form-urlencoded` format required by the Salesforce OAuth2 endpoint.

- **Where It’s Used**:
  - **In `dataconnect.js`**: To format the OAuth2 credentials as URL-encoded data for the POST request.

- **Key Methods Used**:
  - **`qs.stringify(object)`**:
    - Converts a JavaScript object into a query string format.
    - Example in `dataconnect.js`:
      ```javascript
      const data = qs.stringify({
          grant_type: 'password',
          client_id: 'your_client_id',
          client_secret: 'your_client_secret',
          username: 'your_username',
          password: 'your_password'
      });
      ```
    - **Advantage**: Ensures compatibility with the `application/x-www-form-urlencoded` content type, which is required by many APIs (including Salesforce's OAuth2 endpoint).

---

### **3. fs**
- **Purpose**:
  - `fs` is Node.js’s built-in file system module.
  - It allows reading, writing, and managing files in the local file system.

- **Where It’s Used**:
  - **In `dataconnect.js`**: To read the configuration file (`config.json`) containing the OAuth2 credentials.
  - **In `createlead.js`**:
    - To read the Lead data model from `leadModel.json`.
    - To save the details of created Leads to a timestamped JSON file.

- **Key Methods Used**:
  - **`fs.readFileSync(path, encoding)`**:
    - Reads the contents of a file synchronously.
    - Example in `createlead.js`:
      ```javascript
      const leadData = JSON.parse(fs.readFileSync('leadModel.json', 'utf8'));
      ```
    - **Advantage**: Simple and reliable for reading configuration or model files during runtime.

  - **`fs.writeFileSync(path, data, encoding)`**:
    - Writes data to a file synchronously.
    - Example in `createlead.js`:
      ```javascript
      fs.writeFileSync(filepath, JSON.stringify(leadDetails, null, 2), 'utf8');
      ```
    - **Advantage**: Ensures data persistence (e.g., saving Lead details) in a straightforward manner.

  - **`fs.existsSync(path)`**:
    - Checks if a file exists.
    - Example in `dataconnect.js`:
      ```javascript
      if (!fs.existsSync('config.json')) {
          console.error('Configuration file not found.');
      }
      ```
    - **Advantage**: Prevents runtime errors by verifying dependencies (like `config.json` or `leadModel.json`) before proceeding.

---

### **4. path**
- **Purpose**:
  - `path` is a Node.js built-in module for handling and transforming file paths.
  - It ensures cross-platform compatibility when dealing with file paths.

- **Where It’s Used**:
  - **In `dataconnect.js` and `createlead.js`**: To resolve file paths for `config.json` and `leadModel.json`.

- **Key Methods Used**:
  - **`path.resolve([...segments])`**:
    - Constructs an absolute file path.
    - Example in `dataconnect.js`:
      ```javascript
      const configPath = path.resolve(__dirname, 'config.json');
      ```
    - **Advantage**: Handles platform-specific path separators (`/` vs `\\`), ensuring the code works on all systems.

---

### **Why These Libraries and Methods?**

1. **Efficient API Interaction**:
   - **Axios** provides a straightforward way to send HTTP requests and handle responses, simplifying interaction with Salesforce's REST API.

2. **Data Serialization**:
   - **qs** ensures data is formatted correctly for APIs requiring `application/x-www-form-urlencoded`.

3. **File Handling**:
   - **fs** makes it easy to manage local configuration and data files, enabling reusable and flexible workflows.

4. **Cross-Platform Compatibility**:
   - **path** ensures file paths are resolved correctly, regardless of the operating system.

---

### **Advantages of Using These Libraries**

- **Ease of Use**:
  - With libraries like Axios and qs, you can focus on logic rather than low-level details (e.g., formatting headers or encoding data).

- **Robust Error Handling**:
  - Axios simplifies error handling for HTTP requests, while `fs.existsSync` and `path.resolve` ensure smooth file management.

- **Reusable and Modular**:
  - By integrating these libraries into reusable functions (e.g., `dataconnect.js` for authentication), the project becomes maintainable and extensible.

- **Compatibility**:
  - Using standard libraries like `fs` and `path` ensures the project works across all environments, including Linux, Windows, and macOS.

This thoughtful selection of libraries and methods ensures the project remains simple, reliable, and efficient while meeting the needs of developers working with Salesforce APIs.

---
## **Conclusion**

### **How This Makes a Difference**
Let’s revisit the workflow:
1. **Without This Project**:
   - Manually enter leads in the Salesforce UI for each environment.
   - Keep track of records in a spreadsheet or other manual methods.
   - Spend hours repeating the same steps every time a test cycle is initiated.

2. **With This Project**:
   - Run a single Node.js script to create leads in any Salesforce environment in seconds.
   - Retrieve and validate the created records programmatically.
   - Automatically save the Lead details for auditing and debugging.

---

### **Real-World Impact**
For a QA engineer running tests on workflows involving hundreds of leads, this project reduces hours of manual work to just a few minutes. For a developer automating integration tests, it ensures data consistency and eliminates errors caused by manual data entry.

By providing a streamlined, automated way to manage test data, this project enables teams to focus on what truly matters—building, testing, and delivering high-quality Salesforce applications.

This weekend project equips you with the skills to automate Salesforce data manipulation using Node.js. You’ve learned how to authenticate, create leads programmatically, retrieve their details, and save them for auditing. These foundational skills can be expanded into more advanced workflows, including end-to-end testing, which we’ll explore in **Part 2**.
