import mysql from "mysql";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

export default class ProblemsService {
  constructor() {
    this.pool = pool;
  }

  async addProblem(body, res) {
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
      this.pool.query(
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
  }

  async getAllProblems(res) {
    this.pool.query(
      "SELECT * FROM probleme WHERE Stare=1",
      (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      }
    );
  }

  async getAllPendingProblems(res) {
    this.pool.query(
      "SELECT * FROM probleme WHERE Stare=0",
      (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      }
    );
  }

  async searchProblems(body, res) {
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

      this.pool.query(sqlQuery, queryParams, (error, results) => {
        if (error) return sendErrorResponse(res, 500, "Database error");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      sendErrorResponse(res, 400, "Invalid JSON");
    }
  }

  async searchProblemsAdmin(body, res) {
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

      this.pool.query(sqlQuery, queryParams, (error, results) => {
        if (error) return sendErrorResponse(res, 500, "Database error");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      sendErrorResponse(res, 400, "Invalid JSON");
    }
  }

  async GetProblemForStudent(body, res) {
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

      this.pool.query(query, [elevID], (error, results) => {
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
  }

  async ProblemApproval(body, res) {
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
      this.pool.query(queryProblemExist, [problemId], (err, results) => {
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
          this.pool.query(query, [problemId], (error, results) => {
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
          this.pool.query(query, [problemId], (error, results) => {
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
  }

  async getProblemById(res, id) {
    this.pool.query(
      "SELECT * FROM probleme WHERE ID = ?",
      [id],
      (error, results) => {
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
      }
    );
  }
}
