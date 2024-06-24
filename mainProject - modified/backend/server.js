import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const url = require("url");
const bcrypt = require("bcrypt");
import Router from "./routes.js";

// Configurarea conexiunii la baza de date
const dbConfig = {
  host: "informatix-informatix.h.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_1u_r2mfq1FxPl9dd3yX",
  database: "defaultdb",
  port: 22933,
};

// Crearea unui pool de conexiuni MySQL
const pool = mysql.createPool(dbConfig);

// Serverul rulează pe localhost
const ip = "localhost";
const port = 3000;

// Helper function to serve static files
function serveFile(filePath, res, contentType) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>", "utf-8");
      } else {
        res.writeHead(500);
        res.end(`Sorry, there was an error: ${error.code} ..\n`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
}

// Mime types mapping
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".svg": "application/image/svg+xml",
};

// Functie pentru a manevra cererile de autentificare

function sendErrorResponse(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message }));
}

const server = http.createServer((req, res) => {
  const baseDir = path.join(__dirname, "..", "frontend");
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  let filePath = "";

  const router = new Router();

  if (req.method === "GET") {
    if (req.url === "/") {
      filePath = path.join(baseDir, "pages", "notLogged.html");
    } else if (req.url === "/login") {
      filePath = path.join(baseDir, "pages", "loginPage.html");
    } else if (req.url === "/signup") {
      filePath = path.join(baseDir, "pages", "signupPage.html");
    } else if (req.url === "/createGroup") {
      filePath = path.join(baseDir, "pages", "createGroup.html");
    } else if (req.url === "/createHW") {
      filePath = path.join(baseDir, "pages", "createHW.html");
    } else if (req.url === "/loggedStudent") {
      filePath = path.join(baseDir, "pages", "loggedStudent.html");
    } else if (req.url === "/loggedAdmin") {
      filePath = path.join(baseDir, "pages", "loggedAdmin.html");
    } else if (req.url === "/loggedTeacher") {
      filePath = path.join(baseDir, "pages", "loggedTeacher.html");
    } else if (req.url === "/VisGroupsStudent") {
      filePath = path.join(baseDir, "pages", "VisGroupsStudent.html");
    } else if (req.url === "/VisGroupsTeacher") {
      filePath = path.join(baseDir, "pages", "VisGroupsTeacher.html");
    } else if (req.url === "/VisHWStudent") {
      filePath = path.join(baseDir, "pages", "VisHWStudent.html");
    } else if (req.url === "/VisHWTeacher") {
      filePath = path.join(baseDir, "pages", "VisHWTeacher.html");
    } else if (req.url === "/createProblem") {
      filePath = path.join(baseDir, "pages", "createProblem.html");
    } else if (req.url === "/ProfilProfesor") {
      filePath = path.join(baseDir, "pages", "ProfilProfesor.html");
    } else if (req.url.startsWith("/VisProblemGuest")) {
      filePath = path.join(baseDir, "pages", "VisProblemGuest.html");
    } else if (req.url === "/ProfilStudent") {
      filePath = path.join(baseDir, "pages", "ProfilStudent.html");
    } else if (req.url === "/uniqueGroupProfesor") {
      filePath = path.join(baseDir, "pages", "uniqueGroupProfesor.html");
    } else if (req.url === "/uniqueGroupStudent") {
      filePath = path.join(baseDir, "pages", "uniqueGroupStudent.html");
    } else if (req.url === "/uniqueHWProfesor") {
      filePath = path.join(baseDir, "pages", "uniqueHWProfesor.html");
    } else if (req.url === "/uniqueHWStudent") {
      filePath = path.join(baseDir, "pages", "uniqueHWStudent.html");
    } else if (req.url === "/solutionSubmittedProfesor") {
      filePath = path.join(baseDir, "pages", "solutionSubmittedProfesor.html");
    } else if (req.url === "/solutionSubmittedStudent") {
      filePath = path.join(baseDir, "pages", "solutionSubmittedStudent.html");
    } else if (req.url === "/submitedProblems") {
      filePath = path.join(baseDir, "pages", "submitedProblems.html");
    } else if (req.url.startsWith("/VisProblemStudent")) {
      filePath = path.join(baseDir, "pages", "VisProblemStudent.html");
    } else if (req.url.startsWith("/VisProblemTeacher")) {
      filePath = path.join(baseDir, "pages", "VisProblemTeacher.html");
    } else if (req.url.startsWith("/VisProblemAdmin")) {
      filePath = path.join(baseDir, "pages", "VisProblemAdmin.html");
    } else if (req.url.startsWith("/VisComments")) {
      filePath = path.join(baseDir, "pages", "CommentsPage.html");
    } else {
      // Serve static files (CSS, images, etc.)
      filePath = path.join(baseDir, req.url);
    }

    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || "application/octet-stream";
    serveFile(filePath, res, contentType);
  } else {
    router.route(req, res);
  }
});

server.listen(port, ip, () => {
  console.log(`Server is listening at http://${ip}:${port}`);
});
