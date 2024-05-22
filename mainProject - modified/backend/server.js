const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

// Configurarea conexiunii la baza de date
const dbConfig = {
    host: 'informatix-informatix.h.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_1u_r2mfq1FxPl9dd3yX',
    database: 'defaultdb',
    port: 22933
};

// Crearea unui pool de conexiuni MySQL
const pool = mysql.createPool(dbConfig);

// Serverul rulează pe localhost
const ip = "localhost";
const port = 3000;

// Functie pentru a manevra cererile de autentificare
const handleLogin = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { username, password } = JSON.parse(body);
            console.log('Username:', username);
            console.log('Password:', password);

            const queryStudent = 'SELECT id FROM elevi WHERE nume = ? AND parola = ?';
            pool.query(queryStudent, [username, password], (error, results) => {
                if (error) {
                    console.error('Error querying database:', error);
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: false, message: 'Database error' }));
                    return;
                }

                if (results.length > 0) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: true, userType: 'elev', id: results[0].id }));
                } else {
                    const queryTeacher = 'SELECT id FROM profesori WHERE nume = ? AND parola = ?';
                    pool.query(queryTeacher, [username, password], (error, results) => {
                        if (error) {
                            console.error('Error querying database:', error);
                            res.writeHead(500, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ success: false, message: 'Database error' }));
                            return;
                        }

                        if (results.length > 0) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ success: true, userType: 'profesor', id: results[0].id }));
                        } else {
                            res.writeHead(401, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ success: false, message: 'Invalid username or password' }));
                        }
                    });
                }
            });
        } catch (err) {
            console.error('Error parsing JSON:', err);
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
        }
    });
};

// Functie pentru a manevra cererile de adăugare student
const handleAddStudent = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { name, email, password } = JSON.parse(body);

            const query = 'INSERT INTO elevi (nume, email, parola) VALUES (?, ?, ?)';
            pool.query(query, [name, email, password], (error, results) => {
                if (error) {
                    console.error('Error inserting data:', error);
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: false, message: 'Database error' }));
                } else {
                    const userId = results.insertId;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: true, userType: 'elev', id: userId }));
                }
            });
        } catch (err) {
            console.error('Error parsing JSON:', err);
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
        }
    });
};

// Functie pentru a manevra cererile de adăugare profesor
const handleAddTeacher = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { name, email, password } = JSON.parse(body);

            const query = 'INSERT INTO profesori (nume, email, parola) VALUES (?, ?, ?)';
            pool.query(query, [name, email, password], (error, results) => {
                if (error) {
                    console.error('Error inserting data:', error);
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: false, message: 'Database error' }));
                } else {
                    const userId = results.insertId;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: true, userType: 'profesor', id: userId }));
                }
            });
        } catch (err) {
            console.error('Error parsing JSON:', err);
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
        }
    });
};

const server = http.createServer((req, res) => {
    const baseDir = path.join(__dirname, '..', 'frontend');

    let filePath = '';
    if (req.method === 'GET') {
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
    } else if (req.method === 'POST' && req.url === '/addStudent') {
        handleAddStudent(req, res);
    } else if (req.method === 'POST' && req.url === '/addTeacher') {
        handleAddTeacher(req, res);
    } else if (req.method === 'POST' && req.url === '/login') {
        handleLogin(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false, message: 'Not Found' }));
    }
});

server.listen(port, ip, () => {
    console.log(`Server is listening at http://${ip}:${port}`);
});
