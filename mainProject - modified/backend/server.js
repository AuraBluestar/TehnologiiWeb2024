const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const baseDir = path.join(__dirname, '..', 'frontend');
    
    let filePath = '';
    if (req.url === '/') {
        filePath = path.join(baseDir, 'pages', 'notLogged.html');
    } else if (req.url === '/login') {
        filePath = path.join(baseDir, 'pages', 'loginPage.html');
    } else if (req.url === '/signup') {
        filePath = path.join(baseDir, 'pages', 'signupPage.html');
    } else if (req.url === '/createGroup') {
        filePath = path.join(baseDir, 'pages', 'createGroup.html');
    } else if (req.url === '/createHW') {
        filePath = path.join(baseDir, 'pages', 'createHW.html');
    } else if (req.url === '/loggedStudent') {
        filePath = path.join(baseDir, 'pages', 'loggedStudent.html');
    } else if (req.url === '/loggedTeacher') {
        filePath = path.join(baseDir, 'pages', 'loggedTeacher.html');
    } else if (req.url === '/VisGroupsStudent') {
        filePath = path.join(baseDir, 'pages', 'VisGroupsStudent.html');
    } else if (req.url === '/VisGroupsTeacher') {
        filePath = path.join(baseDir, 'pages', 'VisGroupsTeacher.html');
    } else if (req.url === '/VisHWStudent') {
        filePath = path.join(baseDir, 'pages', 'VisHWStudent.html');
    } else if (req.url === '/VisHWTeacher') {
        filePath = path.join(baseDir, 'pages', 'VisHWTeacher.html');
    } else {
        // Serve static files (CSS, images, etc.)
        filePath = path.join(baseDir, req.url);
    }

    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();

    // Mime types
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml',
    };

    // Default to html if no extension is found
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Sorry, there was an error: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});
