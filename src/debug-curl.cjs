const http = require('http');

const os = require('os');
const nets = os.networkInterfaces();
let ip = '127.0.0.1';

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            ip = net.address;
        }
    }
}
console.log('Connecting to:', ip);
http.get(`http://${ip}:3000/login`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(data);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
