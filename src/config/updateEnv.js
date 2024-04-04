const fs = require('fs');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

// Function to fetch token from Shiprocket using authlogin API
async function fetchShiprocketToken() {
    try {
        // Fetch credentials from environment variables
        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;

        // Make POST request to authlogin API
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/auth/login',
            { email, password }
        );

        // Extract token from response data
        const token = response.data.token;

        console.log('token***', token)
        // Set token in environment variable
        process.env.SHIPROCKET_TOKEN = token;

        // Update token in .env file
        updateEnvFile({ SHIPROCKET_TOKEN: token });

        console.log('updated: ', process.env.SHIPROCKET_TOKEN)
        // Return the token
        return token;
    } catch (error) {
        // Handle errors
        console.error('Error fetching Shiprocket token:', error);
        throw error;
    }
}

// Function to update variables in .env file
function updateEnvFile(newVariables) {
    const envFilePath = '.env';

    // Read current content of .env file
    const currentEnvContent = fs.readFileSync(envFilePath, 'utf8');

    // Parse current content into object
    const currentEnvObject = currentEnvContent
        .split('\n')
        .reduce((acc, line) => {
            const [key, value] = line.split('=');
            acc[key] = value;
            return acc;
        }, {});

    // Merge new variables with current variables
    const updatedEnvObject = { ...currentEnvObject, ...newVariables };

    // Convert object back to string
    const updatedEnvContent = Object.entries(updatedEnvObject)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Write updated content to .env file
    fs.writeFileSync(envFilePath, updatedEnvContent);
}

// Function to schedule token update every 3 days
async function scheduleTokenUpdate() {
    try {
        // Fetch initial token
        // await fetchShiprocketToken();

        // Schedule token update every 3 days
        setInterval(async () => {
            await fetchShiprocketToken();
        }, 2 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
    } catch (error) {
        console.error('Error scheduling token update:', error);
    }
}

// Start scheduling token update
scheduleTokenUpdate();
