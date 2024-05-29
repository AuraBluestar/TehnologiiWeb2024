const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const url = require("url");

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


// Functie pentru a manevra cererile de autentificare
const handleLogin = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { username, password } = JSON.parse(body);
      console.log("Username:", username);
      console.log("Password:", password);

      const queryStudent = "SELECT id FROM elevi WHERE nume = ? AND parola = ?";
      pool.query(queryStudent, [username, password], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        if (results.length > 0) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              userType: "elev",
              id: results[0].id,
            })
          );
        } else {
          const queryTeacher =
            "SELECT id FROM profesori WHERE nume = ? AND parola = ?";
          pool.query(queryTeacher, [username, password], (error, results) => {
            if (error) {
              console.error("Error querying database:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: false, message: "Database error" })
              );
              return;
            }

            if (results.length > 0) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: true,
                  userType: "profesor",
                  id: results[0].id,
                })
              );
            } else {
              res.writeHead(401, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Invalid username or password",
                })
              );
            }
          });
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

function sendErrorResponse(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message }));
}

// Functie pentru a manevra cererile de adăugare student
const handleAddStudent = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { name, email, password } = JSON.parse(body);

      const query = "INSERT INTO elevi (nume, email, parola) VALUES (?, ?, ?)";
      pool.query(query, [name, email, password], (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          const userId = results.insertId;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: true, userType: "elev", id: userId })
          );
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Functie pentru a manevra cererile de adăugare profesor
const handleAddTeacher = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { name, email, password } = JSON.parse(body);

      const query =
        "INSERT INTO profesori (nume, email, parola) VALUES (?, ?, ?)";
      pool.query(query, [name, email, password], (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          const userId = results.insertId;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: true, userType: "profesor", id: userId })
          );
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Functie pentru a manevra cererile de adăugare problemă
const handleAddProblem = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { titlu, descriere, profesorID, dificultate, capitol } =
        JSON.parse(body);

      // Verificarea validității datelor
      if (!titlu || !descriere || !profesorID || !dificultate || !capitol) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Missing required fields" })
        );
        return;
      }

      const query =
        "INSERT INTO probleme (Titlu, Descriere, ProfesorID, Dificultate, Capitol) VALUES (?, ?, ?, ?, ?)";
      pool.query(
        query,
        [titlu, descriere, profesorID, dificultate, capitol],
        (error, results) => {
          if (error) {
            console.error("Error inserting data:", error.sqlMessage);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                message: "Database error",
                error: error.sqlMessage,
              })
            );
          } else {
            const problemId = results.insertId;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: problemId }));
          }
        }
      );
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea tuturor problemelor
const getAllProblems = (res) => {
  pool.query("SELECT * FROM probleme where stare=1", (error, results) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(results));
  });
};

// Funcție pentru obținerea unei probleme după ID
function getProblemById(res, id) {
  pool.query("SELECT * FROM probleme WHERE ID = ?", [id], (error, results) => {
    if (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    if (results.length === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Problem not found" }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify(results[0]));
  });
}

// Controller function for searching problems
function searchProblems(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { text = "", difficulty = "all", category = "all" } = JSON.parse(body);

      let sqlQuery = "SELECT * FROM probleme WHERE Stare=1";
      const queryParams = [];

      if (text) {
        sqlQuery += " AND (Titlu LIKE ? OR Descriere LIKE ? OR ID LIKE ?)";
        queryParams.push(`%${text}%`, `%${text}%`, `%${text}%`);
      }

      if (difficulty !== "all") {
        let difficultyInt;
        if (difficulty === "easy") {
          difficultyInt = 0;
        } else if (difficulty === "medium") {
          difficultyInt = 1;
        } else if (difficulty === "hard") {
          difficultyInt = 2;
        }
        if (difficultyInt !== undefined) {
          sqlQuery += " AND Dificultate = ?";
          queryParams.push(difficultyInt);
        }
      }

      if (category !== "all") {
        sqlQuery += " AND Capitol = ?";
        queryParams.push(category);
      }

      pool.query(sqlQuery, queryParams, (error, results) => {
        if (error) return sendErrorResponse(res, 500, "Database error");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      sendErrorResponse(res, 400, "Invalid JSON");
    }
  });
}

// Functie pentru a manevra cererile de adăugare clasă
const handleAddClass = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { nume, profesorID, materie } = JSON.parse(body);

      const query =
        "INSERT INTO clase (Nume, ProfesorID, Materie) VALUES (?, ?, ?)";
      pool.query(query, [nume, profesorID, materie], (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          const classId = results.insertId;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, id: classId }));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Functie pentru a manevra cererile de adăugare elev în clasă
const handleAddStudentToClass = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { classId, studentId } = JSON.parse(body);

      const query = "INSERT INTO claseelevi (ClasaID, ElevID) VALUES (?, ?)";
      pool.query(query, [classId, studentId], (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Functie pentru a obține toate clasele pentru un anumit ProfesorID
function getAllClassesForProfesor(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { profesorID } = JSON.parse(body);

      // Verificare dacă profesorID este furnizat
      if (!profesorID) {
        return sendErrorResponse(res, 400, "ProfesorID is required");
      }

      // Interogare pentru a obține toate clasele pentru profesorul dat
      const query = "SELECT * FROM clase WHERE ProfesorID = ?";
      pool.query(query, [profesorID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          return sendErrorResponse(res, 500, "Database error");
        }

        // Returnare rezultate în format JSON
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      sendErrorResponse(res, 400, "Invalid JSON");
    }
  });
}

// Controller function for searching problems
function searchClasses(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { text = "", subject = "none" } = JSON.parse(body);

      let sqlQuery = "SELECT * FROM clase WHERE 1=1";
      const queryParams = [];

      if (text) {
        sqlQuery += " AND Grupa LIKE ?";
        queryParams.push(`%${text}%`);
      }

      if (subject !== "none") {
        sqlQuery += " AND Materie = ?";
        queryParams.push(subject);
      }

      pool.query(sqlQuery, queryParams, (error, results) => {
        if (error) return sendErrorResponse(res, 500, "Database error");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      sendErrorResponse(res, 400, "Invalid JSON");
    }
  });
}

const server = http.createServer((req, res) => {
  const baseDir = path.join(__dirname, "..", "frontend");
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  let filePath = "";

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
    } else {
      // Serve static files (CSS, images, etc.)
      filePath = path.join(baseDir, req.url);
    }

    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();

    // Mime types
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

    // Default to html if no extension is found
    const contentType = mimeTypes[extname] || "application/octet-stream";

    // Read the file
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
  } else if (req.method === "POST" && pathname === "/login") {
    handleLogin(req, res);
  } else if (req.method === "POST" && pathname === "/addStudent") {
    handleAddStudent(req, res);
  } else if (req.method === "POST" && pathname === "/addTeacher") {
    handleAddTeacher(req, res);
  } else if (req.method === "POST" && pathname === "/problems/add") {
    handleAddProblem(req, res);
  } else if (req.method === "POST" && pathname === "/classes/add") {
    handleAddClass(req, res);
  } else if (req.method === "POST" && pathname === "/problems/all") {
    getAllProblems(res);
  } else if (req.method === "POST" && pathname.startsWith("/problems/search")) {
    searchProblems(req, res);
  } else if ( req.method === "POST" && pathname.startsWith("/classes/search/Teacher")) {
    searchClasses(req, res);
  } else if (req.method === "POST" && pathname.startsWith("/problems/")) {
    const problemId = pathname.split("/")[2];
    getProblemById(res, problemId);
  } else if (req.method === "POST" && pathname === "/classes/all/Teacher") {
    getAllClassesForProfesor(req, res);
  } else if (req.method === "POST" && pathname === "/classes/addStudent") {
    handleAddStudentToClass(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Not Found" }));
  }
});

server.listen(port, ip, () => {
  console.log(`Server is listening at http://${ip}:${port}`);
});
