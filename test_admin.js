const axios = require('axios');
const API_BASE_URL = 'http://localhost:5000';

async function testAdmin() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_BASE_URL}/api/user/admin/login`, {
            email: 'sudhanshu.ok1802@gmail.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Token acquired", token.substring(0, 20) + "...");

        const headers = { 'x-admin-token': token };

        console.log("Fetching stats...");
        let res = await axios.get(`${API_BASE_URL}/api/user/admin/stats`, { headers });
        console.log("Stats OK:", res.data);

        console.log("Fetching users...");
        res = await axios.get(`${API_BASE_URL}/api/user/admin/users`, { headers });
        console.log("Users OK:", res.data.length);

        console.log("Fetching feedback...");
        res = await axios.get(`${API_BASE_URL}/api/user/admin/feedback`, { headers });
        console.log("Feedback OK:", res.data.length);

    } catch (err) {
        console.error("API Failed!", err.response ? err.response.data : err.message);
    }
}
testAdmin();
