const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function getToken() {
    try {
        const email = `bypass_${Date.now()}@test.com`;
        console.log(`Attempting to register user: ${email}`);

        try {
            const regResponse = await axios.post(`${API_URL}/register`, {
                name: 'Bypass User',
                email: email,
                password: 'password123'
            });

            console.log('Registration successful!');
            if (regResponse.data.token) {
                console.log('TOKEN:', regResponse.data.token);
                console.log('USER:', JSON.stringify(regResponse.data.user));
                return;
            }
        } catch (regError) {
            console.log('Registration failed (might already exist or error):', regError.response?.data || regError.message);
        }

        // Fallback to login if needed (though we used unique email)
        console.log('Attempting login...');
        const loginResponse = await axios.post(`${API_URL}/login`, {
            email: email,
            password: 'password123'
        });
        console.log('Login successful!');
        console.log('TOKEN:', loginResponse.data.token);
        console.log('USER:', JSON.stringify(loginResponse.data.user));

    } catch (error) {
        console.error('Fatal Error:', error.response?.data || error.message);
    }
}

getToken();
