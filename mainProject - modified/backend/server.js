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

// Functie pentru a manevra cererile de adăugare temă
const handleAddHomework = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ClasaID, ProfesorID } = JSON.parse(body);

      const query = "INSERT INTO teme (ClasaID, ProfesorID) VALUES (?, ?)";
      pool.query(query, [ClasaID, ProfesorID], (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          const homeworkId = results.insertId;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, id: homeworkId }));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Functie pentru a manevra cererile de adăugare problemă la temă
const handleAddProblemToHomework = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { HomeworkID, ProblemID } = JSON.parse(body);

      const query =
        "INSERT INTO problemeteme (TemaID, ProblemaID) VALUES (?, ?)";
      pool.query(query, [HomeworkID, ProblemID], (error, results) => {
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

// Funcție pentru obținerea usernameului a unui prof după ID
function getTeacherById(res, id) {
  pool.query(
    "SELECT nume FROM profesori WHERE ID = ?",
    [id],
    (error, results) => {
      if (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      if (results.length === 0) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Teacher not found" }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify(results[0]));
    }
  );
}

// Controller function for searching problems
function searchProblems(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const {
        text = "",
        difficulty = "all",
        category = "all",
      } = JSON.parse(body);

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
      const { grupa, profesorID, materie } = JSON.parse(body);

      const query =
        "INSERT INTO clase (Grupa, ProfesorID, Materie) VALUES (?, ?, ?)";
      pool.query(query, [grupa, profesorID, materie], (error, results) => {
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
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          }
          return;
        } else {
          if (!res.headersSent) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
      }
    }
  });
};

// Functie pentru a obține toate grupele pentru un anumit ProfesorID
function getAllGroupsForProfesor(req, res) {
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
      const query = "SELECT Materie, Grupa, Id FROM clase WHERE ProfesorID = ?";
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

// Functie pentru a obține toate grupele pentru un anumit ElevID
function getAllGroupsForStudent(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { elevID } = JSON.parse(body);

      // Verificare dacă elevID este furnizat
      if (!elevID) {
        return sendErrorResponse(res, 400, "ElevID is required");
      }

      // Interogare pentru a obține toate clasele pentru profesorul dat
      const query =
        "SELECT distinct Materie, Grupa, clase.ID FROM clase join claseelevi on clase.ID=claseelevi.ClasaID WHERE ElevID = ?";
      pool.query(query, [elevID], (error, results) => {
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

// Controller function for searching groups
function searchClassesTeacher(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { text = "", subject = "none", profesorID } = JSON.parse(body);

      if (!profesorID) {
        return sendErrorResponse(res, 400, "Missing profesorID");
      }

      let sqlQuery = "SELECT * FROM clase WHERE ProfesorID = ?";
      const queryParams = [profesorID];

      if (text) {
        sqlQuery += " AND Grupa LIKE ?";
        queryParams.push(`%${text}%`);
      }

      if (subject !== "none") {
        sqlQuery += " AND Materie LIKE ?";
        queryParams.push(`%${subject}%`);
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

// Controller function for searching groups
function searchClassesStudent(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { text = "", subject = "none", elevID } = JSON.parse(body);

      if (!elevID) {
        return sendErrorResponse(res, 400, "Missing elevID");
      }

      let sqlQuery =
        "SELECT distinct Materie, Grupa, clase.ID, profesorID FROM clase join claseelevi on clase.ID=claseelevi.ClasaID WHERE ElevID=  ?";
      const queryParams = [elevID];

      if (text) {
        sqlQuery += " AND Grupa LIKE ?";
        queryParams.push(`%${text}%`);
      }

      if (subject !== "none") {
        sqlQuery += " AND Materie LIKE ?";
        queryParams.push(`%${subject}%`);
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

// Funcție pentru obținerea ID-ului unui elev după nume
const getStudentIdByName = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { nume } = JSON.parse(body);

      if (!nume) {
        return sendErrorResponse(res, 400, "Name is required");
      }

      const query = "SELECT id FROM elevi WHERE nume = ?";
      pool.query(query, [nume], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          return sendErrorResponse(res, 500, "Database error");
        }

        if (results.length > 0) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, id: results[0].id }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Student not found" })
          );
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      sendErrorResponse(res, 400, "Invalid JSON");
    }
  });
};

// Funcție pentru obținerea temei date de un profesor
const handleGetHomeworkByTeacher = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { profesorID } = JSON.parse(body);

      if (!profesorID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "ProfesorID is required" })
        );
        return;
      }

      const query = `
        SELECT t.profesorID, t.ID AS temaID, t.clasaID, COUNT(pt.ID) AS nrProbleme
        FROM teme t
        JOIN clase c ON t.clasaid = c.id
        JOIN problemeteme pt ON pt.temaid = t.id
        WHERE t.profesorid = ?
        GROUP BY t.id;
      `;

      pool.query(query, [profesorID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: results }));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea temei unui student
const handleGetHomeworkForStudent = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { elevID } = JSON.parse(body);

      if (!elevID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "elevID is required" })
        );
        return;
      }

      const query = `
      SELECT t.profesorID, t.ID AS temaID, t.clasaID, COUNT(distinct pt.ID) AS nrProbleme 
      FROM teme t JOIN clase c ON t.clasaid = c.id JOIN problemeteme pt ON pt.temaid = t.id 
      join claseelevi ce on ce.clasaid=c.id WHERE ce.elevid = ? GROUP BY t.id;`;

      pool.query(query, [elevID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: results }));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

//functie pt adaugare rezolvare  la o problema
const handleAddSolution = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ProblemaID, ElevID, Rezolvare } = JSON.parse(body);

      // Verificarea validității datelor
      if (!ProblemaID || !ElevID || !Rezolvare) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Missing required fields" })
        );
        return;
      }

      const query =
        "INSERT INTO rezolvari (ProblemaID, ElevID, Rezolvare) VALUES (?, ?, ?)";
      pool.query(
        query,
        [ProblemaID, ElevID, Rezolvare],
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
            const solutionId = results.insertId;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: solutionId }));
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

// Function to check if a problem is part of a homework assigned to a student
const handleCheckProblemInHomework = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { elevID, problemaID } = JSON.parse(body);

      if (!elevID || !problemaID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "elevID and problemaID are required" }));
        return;
      }

      const query = `
        SELECT COUNT(*) as count
        FROM problemeteme pt
        JOIN teme t ON pt.temaID = t.ID
        JOIN claseelevi ce ON t.clasaID = ce.ClasaID
        WHERE ce.ElevID = ? AND pt.ProblemaID = ?;
      `;

      pool.query(query, [elevID, problemaID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Database error" }));
          return;
        }

        const isAssigned = results[0].count > 0;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, isAssigned }));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};


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
    } else if (req.url.startsWith("/VisProblemGuest")) {
      filePath = path.join(baseDir, "pages", "VisProblemGuest.html");
    } else if (req.url.startsWith("/VisProblemStudent")) {
      filePath = path.join(baseDir, "pages", "VisProblemStudent.html");
    } else if (req.url.startsWith("/VisProblemTeacher")) {
      filePath = path.join(baseDir, "pages", "VisProblemTeacher.html");
    } else {
      // Serve static files (CSS, images, etc.)
      filePath = path.join(baseDir, req.url);
    }

    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || "application/octet-stream";
    serveFile(filePath, res, contentType);
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
  } else if (
    req.method === "POST" &&
    pathname.startsWith("/classes/search/Teacher")
  ) {
    searchClassesTeacher(req, res);
  } else if (
    req.method === "POST" &&
    pathname.startsWith("/classes/search/Student")
  ) {
    searchClassesStudent(req, res);
  } else if (req.method === "POST" && pathname.startsWith("/problems/")) {
    const problemId = pathname.split("/")[2];
    getProblemById(res, problemId);
  } else if (req.method === "POST" && pathname.startsWith("/Teacher/")) {
    const teacherId = pathname.split("/")[2];
    getTeacherById(res, teacherId);
  } else if (req.method === "POST" && pathname === "/classes/all/Teacher") {
    getAllGroupsForProfesor(req, res);
  } else if (req.method === "POST" && pathname === "/classes/all/Student") {
    getAllGroupsForStudent(req, res);
  } else if (req.method === "POST" && pathname === "/classes/addStudent") {
    handleAddStudentToClass(req, res);
  } else if (req.method === "POST" && pathname === "/student/id") {
    getStudentIdByName(req, res);
  } else if (req.method === "POST" && pathname === "/homeworks/teacher") {
    handleGetHomeworkByTeacher(req, res);
  } else if (req.method === "POST" && pathname === "/homeworks/student") {
    handleGetHomeworkForStudent(req, res);
  } else if (req.method === "POST" && pathname === "/homework/add") {
    handleAddHomework(req, res);
  } else if (req.method === "POST" && pathname === "/homework/addProblem") {
    handleAddProblemToHomework(req, res);
  } else if (req.method === "POST" && pathname === "/solutions/add") {
    handleAddSolution(req, res);
  } else if (req.method === "POST" && pathname === "/homeworks/checkProblem") {
    handleCheckProblemInHomework(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Not Found" }));
  }
});

server.listen(port, ip, () => {
  console.log(`Server is listening at http://${ip}:${port}`);
});
