const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>It works! 🚀</h1><p>GitOps via Argo CD</p>`);
});

server.listen(3000, () => console.log('Listening on 3000'));
