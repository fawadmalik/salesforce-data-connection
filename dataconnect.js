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
        console.error(`
Error: Configuration file not found.

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
