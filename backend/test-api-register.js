const http = require('http');

const data = JSON.stringify({
    name: 'Test New Feature User',
    email: 'test_feature_' + Date.now() + '@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', body);
    });
});

req.on('error', error => {
    console.error('Registration failed with error:', error);
});

req.write(data);
req.end();
