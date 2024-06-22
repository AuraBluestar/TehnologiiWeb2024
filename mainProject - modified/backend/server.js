const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const url = require("url");
const bcrypt = require("bcrypt");

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

  req.on("end", async () => {
    try {
      const { username, password } = JSON.parse(body);
      console.log("Username:", username);
      console.log("Password:", password);

      const queryStudent = "SELECT id, parola FROM elevi WHERE nume = ?";
      pool.query(queryStudent, [username], async (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        if (results.length > 0) {
          const validPassword = await bcrypt.compare(
            password,
            results[0].parola
          );
          if (validPassword) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                userType: "elev",
                id: results[0].id,
              })
            );
            return;
          }
        }

        const queryTeacher = "SELECT id, parola FROM profesori WHERE nume = ?";
        pool.query(queryTeacher, [username], async (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
            return;
          }

          if (results.length > 0) {
            const validPassword = await bcrypt.compare(
              password,
              results[0].parola
            );
            if (validPassword) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: true,
                  userType: "profesor",
                  id: results[0].id,
                })
              );
              return;
            }
          }

          const queryAdmin = "SELECT id, parola FROM admin WHERE nume = ?";
          pool.query(queryAdmin, [username], (error, results) => {
            if (error) {
              console.error("Error querying database:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: false, message: "Database error" })
              );
              return;
            }

            if (results.length > 0) {
              const validPassword = password === results[0].parola;
              if (validPassword) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: true,
                    userType: "admin",
                    id: results[0].id,
                  })
                );
                return;
              }
            }

            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                message: "Invalid username or password",
              })
            );
          });
        });
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

  req.on("end", async () => {
    try {
      const { name, email, password } = JSON.parse(body);

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = "INSERT INTO elevi (nume, email, parola) VALUES (?, ?, ?)";
      pool.query(query, [name, email, hashedPassword], (error, results) => {
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

  req.on("end", async () => {
    try {
      const { name, email, password } = JSON.parse(body);

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query =
        "INSERT INTO profesori (nume, email, parola) VALUES (?, ?, ?)";
      pool.query(query, [name, email, hashedPassword], (error, results) => {
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

// Functie pentru a manevra cererile de adăugare notă
const handleAddGrade = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ProblemaID, ElevID, ProfesorID, Valoare } = JSON.parse(body);

      // Verificarea validității datelor
      if (
        !ProblemaID ||
        !ElevID ||
        !ProfesorID ||
        !Valoare ||
        Valoare < 1 ||
        Valoare > 10
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Missing or invalid required fields",
          })
        );
        return;
      }

      const query =
        "INSERT INTO note (ProblemaID, ElevID, ProfesorID, Valoare) VALUES (?, ?, ?, ?)";
      pool.query(
        query,
        [ProblemaID, ElevID, ProfesorID, Valoare],
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
            const gradeId = results.insertId;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: gradeId }));
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

// Funcție pentru obținerea tuturor notelor date de un profesor
const getGradesByTeacher = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ProfesorID } = JSON.parse(body);

      if (!ProfesorID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "ProfesorID is required" })
        );
        return;
      }

      const query = "SELECT * FROM note WHERE ProfesorID = ?";
      pool.query(query, [ProfesorID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea tuturor notelor primite de un elev
const getGradesByStudent = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ElevID } = JSON.parse(body);

      if (!ElevID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "ElevID is required" })
        );
        return;
      }

      const query = "SELECT * FROM note WHERE ElevID = ?";
      pool.query(query, [ElevID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea rapoartelor utilizatorilor
const getUserReports = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { UserID, userType } = JSON.parse(body);

      if (!UserID || !userType) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "UserID and userType are required" })
        );
        return;
      }

      if (userType === "elev") {
        const query = `
          SELECT 
            (SELECT COUNT(DISTINCT problemaId) 
             FROM problemeteme pe 
             JOIN teme t ON t.id=pe.temaID 
             JOIN clase c ON c.id=t.clasaid 
             JOIN claseelevi ce ON ce.clasaid=c.id 
             JOIN elevi e ON e.id=ce.elevid 
             WHERE e.id = ?) AS problems_assigned,
            (SELECT COUNT(DISTINCT pe.problemaid) 
             FROM problemeteme pe 
             JOIN teme t ON t.id = pe.temaid 
             JOIN clase c ON c.id = t.clasaid 
             JOIN claseelevi ce ON ce.clasaid = c.id 
             JOIN elevi e ON e.id = ce.elevid 
             JOIN rezolvari r ON r.elevid = e.id AND r.problemaid = pe.problemaid 
             WHERE e.id = ?) AS problems_solved,
            (SELECT COUNT(DISTINCT pe.problemaid) 
             FROM problemeteme pe 
             JOIN teme t ON t.id = pe.temaid 
             JOIN clase c ON c.id = t.clasaid 
             JOIN claseelevi ce ON ce.clasaid = c.id 
             JOIN elevi e ON e.id = ce.elevid 
             JOIN rezolvari r ON r.elevid = e.id AND r.problemaid = pe.problemaid 
             JOIN note n ON e.id=n.elevid AND n.problemaid=pe.problemaid AND n.valoare>=5
             WHERE e.id = ?) AS problems_solved_correctly
        `;
        pool.query(query, [UserID, UserID, UserID], (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results[0]));
          }
        });
      } else if (userType === "profesor") {
        const query = `
          select (SELECT COUNT(r.ID) FROM rezolvari r JOIN 
          problemeteme pt ON r.ProblemaID = pt.ProblemaID 
          JOIN teme t ON pt.TemaID = t.ID WHERE t.ProfesorID 
          = ?) AS ProblemeDeCorectat, (SELECT COUNT(n.ID)  
          FROM note n WHERE n.ProfesorID = ?) AS ProblemeCorectate;
        `;
        pool.query(query, [UserID, UserID], (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results[0]));
          }
        });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Invalid userType" })
        );
      }
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea rapoartelor problemelor
const getProblemReports = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ProblemID } = JSON.parse(body);

      if (!ProblemID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "ProblemID is required" })
        );
        return;
      }

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM rezolvari WHERE ProblemaID = ?) AS users_tried,
          (SELECT COUNT(*)
          FROM rezolvari r
          JOIN note n ON n.ProblemaID = r.ProblemaID AND n.valoare >= 5
          WHERE r.ProblemaID = 11) AS users_succeeded;
      `;
      pool.query(query, [ProblemID, ProblemID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results[0]));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea tuturor problemelor
const getAllProblems = (res) => {
  pool.query("SELECT * FROM probleme WHERE Stare=1", (error, results) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(results));
  });
};

// Funcție pentru obținerea tuturor problemelor
const getPendingProblems = (res) => {
  pool.query("SELECT * FROM probleme WHERE Stare=0", (error, results) => {
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

// Function to handle adding homework
const handleAddHomework = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ClasaID, ProfesorID } = JSON.parse(body);

      const insertQuery =
        "INSERT INTO teme (ClasaID, ProfesorID) VALUES (?, ?)";
      pool.query(insertQuery, [ClasaID, ProfesorID], (insertError, insertResults) => {
        if (insertError) {
          console.error("Error inserting data:", insertError);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Database error" }));
        } else {
          const homeworkId = insertResults.insertId;
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

// Funcție pentru obținerea usernameului unui elev după ID
function getStudentById(res, id) {
  pool.query("SELECT nume FROM elevi WHERE ID = ?", [id], (error, results) => {
    if (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    if (results.length === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Student not found" }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify(results[0]));
  });
}

// Funcție pentru obținerea unei clase după ID
function getGroupById(res, id) {
  const query =
    "SELECT CONCAT(Grupa, '-', Materie) AS 'Grupa-Materie', ProfesorID FROM clase WHERE ID = ?";
  pool.query(query, [id], (error, results) => {
    if (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    if (results.length === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Group not found" }));
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
          difficultyInt = 1;
        } else if (difficulty === "medium") {
          difficultyInt = 2;
        } else if (difficulty === "hard") {
          difficultyInt = 3;
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


// Controller function for searching problems varianta Admin
function searchProblemsAdmin(req, res) {
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

      let sqlQuery = "SELECT * FROM probleme WHERE Stare=0";
      const queryParams = [];

      if (text) {
        sqlQuery += " AND (Titlu LIKE ? OR Descriere LIKE ? OR ID LIKE ?)";
        queryParams.push(`%${text}%`, `%${text}%`, `%${text}%`);
      }

      if (difficulty !== "all") {
        let difficultyInt;
        if (difficulty === "easy") {
          difficultyInt = 1;
        } else if (difficulty === "medium") {
          difficultyInt = 2;
        } else if (difficulty === "hard") {
          difficultyInt = 3;
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

const handleGetProblemForStudent = (req, res) => {
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

      const query = `select distinct problemaid, profesorid from problemeteme pt 
      join teme t on pt.temaid = t.id join claseelevi ce on 
      ce.clasaid = t.clasaid where elevid=?`;

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
      const { ProblemaID, ElevID, ProfesorID, Rezolvare } = JSON.parse(body);

      // Verificarea validității datelor
      if (!ProblemaID || !ElevID || !ProfesorID || !Rezolvare) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Missing required fields" })
        );
        return;
      }

      const query =
        "INSERT INTO rezolvari (ProblemaID, ElevID, ProfesorID, Rezolvare) VALUES (?, ?, ?, ?)";
      pool.query(
        query,
        [ProblemaID, ElevID, ProfesorID, Rezolvare],
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
        res.end(
          JSON.stringify({
            success: false,
            message: "elevID and problemaID are required",
          })
        );
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
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
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

// Function to handle problem approval or rejection
const handleProblemApproval = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { problemId, status } = JSON.parse(body);

      if (!problemId || !status) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Missing required fields" })
        );
        return;
      }

      const queryProblemExist = "SELECT ID FROM probleme WHERE ID = ?";
      pool.query(queryProblemExist, [problemId], (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        if (results.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Problem not found" })
          );
          return;
        }

        if (status === "accepted") {
          const query = "UPDATE probleme SET Stare = 1 WHERE ID = ?";
          pool.query(query, [problemId], (error, results) => {
            if (error) {
              console.error("Error updating data:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: false, message: "Database error" })
              );
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
            }
          });
        } else if (status === "denied") {
          const query = "DELETE FROM probleme WHERE ID = ?";
          pool.query(query, [problemId], (error, results) => {
            if (error) {
              console.error("Error deleting data:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ success: false, message: "Database error" })
              );
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
            }
          });
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Invalid status value" })
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

// Funcție pentru obținerea materiilor pentru o anumită grupă
const getSubjectsByGroup = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { Grupa, ProfesorID } = JSON.parse(body);

      const query =
        "SELECT Materie FROM clase WHERE Grupa = ? And ProfesorID=? ";
      pool.query(query, [Grupa], [ProfesorID], (error, results) => {
        if (error) {
          console.error("Error fetching subjects:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        const subjects = results.map((row) => row.Materie);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, subjects }));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Funcție pentru obținerea rezolvarilor după elevID
const getSolutionsByStudent = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { elevID, problemaID } = JSON.parse(body);

      if (!elevID || !problemaID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "elevID and problemaID are required",
          })
        );
        return;
      }

      const query = `
        SELECT t.ProfesorID, ce.ClasaID, r.Rezolvare
        FROM claseelevi ce
        JOIN teme t ON ce.ClasaID = t.ClasaID
        JOIN problemeteme pt ON t.ID = pt.TemaID
        JOIN rezolvari r ON pt.ProblemaID = r.ProblemaID AND ce.ElevID = r.ElevID
        WHERE ce.ElevID = ? AND pt.ProblemaID = ?;`;

      pool.query(query, [elevID, problemaID], (error, results) => {
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

// Funcție pentru obținerea rezolvarilor după profesorID
const getSolutionsByTeacher = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { profesorID, problemaID } = JSON.parse(body);

      if (!profesorID || !problemaID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "profesorID and problemaID are required",
          })
        );
        return;
      }

      const query = `
        SELECT claseelevi.ClasaID, claseelevi.ElevID, rezolvari.Rezolvare
        FROM claseelevi
        JOIN teme ON claseelevi.ClasaID = teme.ClasaID
        JOIN problemeteme ON teme.ID = problemeteme.TemaID
        JOIN rezolvari ON problemeteme.ProblemaID = rezolvari.ProblemaID AND claseelevi.ElevID = rezolvari.ElevID
        WHERE problemeteme.ProblemaID = ? AND teme.ProfesorID = ?;`;

      pool.query(query, [problemaID, profesorID], (error, results) => {
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
//functie pt a obtine toti studentii dintr-o tabela
const getStudents = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { GroupID } = JSON.parse(body);

      if (!GroupID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "GroupID is required" })
        );
        return;
      }

      const query =
        "SELECT DISTINCT e.nume FROM claseelevi ce join elevi e on e.id=ce.elevid WHERE clasaid = ?";
      pool.query(query, [GroupID], (error, results) => {
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

const deleteTeacher = (res, teacherId) => {
  const checkerQuery = "SELECT * FROM profesori WHERE ID = ?;";
  const deleteQuery = "DELETE FROM profesori WHERE ID = ?;";

  pool.query(checkerQuery, [teacherId], (error, results) => {
    if (error) {
      console.error("Error querying database:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Database error" }));
      return;
    }

    if (results.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Teacher not found" }));
      return;
    }

    pool.query(deleteQuery, [teacherId], (error) => {
      if (error) {
        console.error("Error deleting teacher:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Database error" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
  });
};

const deleteStudent = (res, studentId) => {
  const checkerQuery = "SELECT * FROM elevi WHERE ID = ?;";
  const deleteQuery = "DELETE FROM elevi WHERE ID = ?;";

  pool.query(checkerQuery, [studentId], (error, results) => {
    if (error) {
      console.error("Error querying database:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Database error" }));
      return;
    }

    if (results.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "student not found" }));
      return;
    }

    pool.query(deleteQuery, [studentId], (error) => {
      if (error) {
        console.error("Error deleting student:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Database error" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
  });
};

const deleteHomework = (res, homeworkId) => {
  const checkerQuery = "SELECT * FROM teme WHERE ID = ?;";
  const deleteProblemsQuery = "DELETE FROM problemeteme WHERE TemaID = ?;";
  const deleteQuery = "DELETE FROM teme WHERE ID = ?;";

  pool.query(checkerQuery, [homeworkId], (error, results) => {
    if (error) {
      console.error("Error querying database:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Database error" }));
      return;
    }

    if (results.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ success: false, message: "homework not found" })
      );
      return;
    }

    pool.query(deleteProblemsQuery, [homeworkId], (error) => {
      if (error) {
        console.error("Error deleting related problems:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Database error" }));
        return;
      }

      pool.query(deleteQuery, [homeworkId], (error) => {
        if (error) {
          console.error("Error deleting homework:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      });
    });
  });
};

const deleteGroup = (res, groupId) => {
  const checkerQuery = "SELECT * FROM clase WHERE ID = ?;";
  const hwProblemsQuery = "SELECT ID FROM teme WHERE ClasaID = ?;";
  const deleteProblemsQuery = "DELETE FROM problemeteme WHERE TemaID = ?;";
  const deleteRelatedTemeQuery = "DELETE FROM teme WHERE ClasaID = ?;";
  const deleteRelatedClaseQuery = "DELETE FROM claseelevi WHERE ClasaID = ?;";
  const deleteQuery = "DELETE FROM clase WHERE ID = ?;";

  pool.query(checkerQuery, [groupId], (error, results) => {
    if (error) {
      console.error("Error querying database:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Database error" }));
      return;
    }

    if (results.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Group not found" }));
      return;
    }

    pool.query(hwProblemsQuery, [groupId], (error, results) => {
      if (error) {
        console.error("Error querying homework problems:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Database error" }));
        return;
      }

      const homeworkIds = results.map(row => row.ID);
      
      const deleteProblemsPromises = homeworkIds.map(homeworkId => {
        return new Promise((resolve, reject) => {
          pool.query(deleteProblemsQuery, [homeworkId], (error) => {
            if (error) {
              return reject(error);
            }
            resolve();
          });
        });
      });

      Promise.all(deleteProblemsPromises)
        .then(() => {
          pool.query(deleteRelatedTemeQuery, [groupId], (error) => {
            if (error) {
              console.error("Error deleting related homeworks:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, message: "Database error" }));
              return;
            }

            pool.query(deleteRelatedClaseQuery, [groupId], (error) => {
              if (error) {
                console.error("Error deleting related class records:", error);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: "Database error" }));
                return;
              }

              pool.query(deleteQuery, [groupId], (error) => {
                if (error) {
                  console.error("Error deleting group:", error);
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: false, message: "Database error" }));
                  return;
                }

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              });
            });
          });
        })
        .catch(error => {
          console.error("Error deleting related problems:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Database error" }));
        });
    });
  });
};

const getProblemsByHomework = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { temaID } = JSON.parse(body);

      if (!temaID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "temaID is required" })
        );
        return;
      }

      const query = "SELECT ProblemaID FROM problemeteme WHERE temaID = ?";
      pool.query(query, [temaID], (error, results) => {
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

const getVotesForProblem = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ProblemaID } = JSON.parse(body);

      if (!ProblemaID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "ProblemaID is required" })
        );
        return;
      }

      const query = `
        SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE FLOOR(AVG(Stele)) END as avg_stars
        FROM voturi
        WHERE ProblemaID = ?;
      `;

      pool.query(query, [ProblemaID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: results[0] }));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

const addVoteToProblem = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { ProblemaID, UtilizatorID, Stele } = JSON.parse(body);

      if (!ProblemaID || !UtilizatorID || !Stele || Stele < 1 || Stele > 5) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Missing or invalid required fields",
          })
        );
        return;
      }

      const query = `
        INSERT INTO voturi (ProblemaID, UtilizatorID, Stele)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Stele = VALUES(Stele);
      `;

      pool.query(query, [ProblemaID, UtilizatorID, Stele], (error, results) => {
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

// Function to get account details
const getAccountDetails = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { id, type } = JSON.parse(body);
      let tableName;

      if (type === "elev") {
        tableName = "elevi";
      } else if (type === "profesor") {
        tableName = "profesori";
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid type" }));
        return;
      }

      const query = `SELECT nume, email FROM ${tableName} WHERE id = ?`;
      pool.query(query, [id], (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        if (results.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "User not found" })
          );
          return;
        }

        const { nume, email } = results[0];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, username: nume, email }));
      });
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });
};

// Function to update account details
const updateAccountDetails = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { id, type, password } = JSON.parse(body);
      let tableName;

      if (type === "elev") {
        tableName = "elevi";
      } else if (type === "profesor") {
        tableName = "profesori";
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid type" }));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `UPDATE ${tableName} SET parola = ? WHERE id = ?`;

      pool.query(query, [hashedPassword, id], (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Account updated successfully",
          })
        );
      });
    } catch (err) {
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
  } else if (req.method === "POST" && pathname === "/problems/pending") {
    getPendingProblems(res);
  } else if (req.method === "POST" && pathname === "/problems/search") {
    searchProblems(req, res);
  } else if (req.method === "POST" && pathname === "/problems/admin/search") {
    searchProblemsAdmin(req, res);
  } else if (req.method === "POST" && pathname === "/classes/search/Teacher") {
    searchClassesTeacher(req, res);
  } else if (req.method === "POST" && pathname === "/classes/search/Student") {
    searchClassesStudent(req, res);
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
  } else if (req.method === "POST" && pathname === "/problems/student") {
    handleGetProblemForStudent(req, res);
  } else if (req.method === "POST" && pathname === "/homework/add") {
    handleAddHomework(req, res);
  } else if (req.method === "POST" && pathname === "/homework/addProblem") {
    handleAddProblemToHomework(req, res);
  } else if (req.method === "POST" && pathname === "/solutions/add") {
    handleAddSolution(req, res);
  } else if (req.method === "POST" && pathname === "/solutions/student") {
    getSolutionsByStudent(req, res);
  } else if (req.method === "POST" && pathname === "/solutions/teacher") {
    getSolutionsByTeacher(req, res);
  } else if (req.method === "POST" && pathname === "/homeworks/checkProblem") {
    handleCheckProblemInHomework(req, res);
  } else if (req.method === "POST" && pathname === "/homeworks/problems") {
    getProblemsByHomework(req, res);
  } else if (req.method === "POST" && pathname === "/problems/approval") {
    handleProblemApproval(req, res);
  } else if (req.method === "POST" && pathname === "/grades/add") {
    handleAddGrade(req, res);
  } else if (req.method === "POST" && pathname === "/grades/teacher") {
    getGradesByTeacher(req, res);
  } else if (req.method === "POST" && pathname === "/grades/student") {
    getGradesByStudent(req, res);
  } else if (req.method === "POST" && pathname === "/reports/user") {
    getUserReports(req, res);
  } else if (req.method === "POST" && pathname === "/reports/problem") {
    getProblemReports(req, res);
  } else if (req.method === "POST" && pathname === "/subjects") {
    getSubjectsByGroup(req, res);
  } else if (req.method === "POST" && pathname === "/classes/students") {
    getStudents(req, res);
  } else if (req.method === "POST" && pathname === "/votes/get") {
    getVotesForProblem(req, res);
  } else if (req.method === "POST" && pathname === "/votes/add") {
    addVoteToProblem(req, res);
  } else if (req.method === "POST" && pathname === "/getAccountDetails") {
    getAccountDetails(req, res);
  } else if (req.method === "POST" && pathname === "/updateAccountDetails") {
    updateAccountDetails(req, res);
  } else if (req.method === "POST" && pathname.startsWith("/problems/")) {
    const problemId = pathname.split("/")[2];
    getProblemById(res, problemId);
  } else if (req.method === "POST" && pathname.startsWith("/Teacher/")) {
    const teacherId = pathname.split("/")[2];
    getTeacherById(res, teacherId);
  } else if (req.method === "POST" && pathname.startsWith("/student/")) {
    const studentId = pathname.split("/")[2];
    getStudentById(res, studentId);
  } else if (req.method === "POST" && pathname.startsWith("/group/")) {
    const groupId = pathname.split("/")[2];
    getGroupById(res, groupId);
  } else if (
    req.method === "DELETE" &&
    pathname.startsWith("/ProfilProfesor")
  ) {
    const teacherId = pathname.split("/")[2];
    deleteTeacher(res, teacherId);
  } else if (req.method === "DELETE" && pathname.startsWith("/ProfilStudent")) {
    const studentId = pathname.split("/")[2];
    deleteStudent(res, studentId);
  } else if (
    req.method === "DELETE" &&
    pathname.startsWith("/uniqueHWProfesor")
  ) {
    const homeworkId = pathname.split("/")[2];
    deleteHomework(res, homeworkId);
  } else if(req.method === "DELETE" && pathname.startsWith("/uniqueGroupProfesor")){
    const groupId = pathname.split("/")[2];
    deleteGroup(res, groupId);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Not Found" }));
  }
});

server.listen(port, ip, () => {
  console.log(`Server is listening at http://${ip}:${port}`);
});
