const http = require('http');

const data = JSON.stringify({
    name: 'NodeUser',
    email: 'node.user.' + Date.now() + '@test.com',
    password: 'Password123'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Requesting:', options);

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY_START');
        console.log(body);
        console.log('BODY_END');
    });
});

req.on('error', (e) => {
    console.error('REQ_ERROR:', e);
});

req.write(data);
req.end();
