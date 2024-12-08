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
