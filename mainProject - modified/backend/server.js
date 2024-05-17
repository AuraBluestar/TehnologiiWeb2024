const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const server = http.createServer((req, res) => {
    // Obține calea către fișierul solicitat din frontend
    const filePath = path.join(__dirname, '..', 'frontend', req.url === '/' ? 'pages/notLogged.html' : req.url);

    // Servește fișierul static folosind comanda 'http-server'
    const command = `http-server "${filePath}" -p 3000 -c-1`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(stdout);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});
