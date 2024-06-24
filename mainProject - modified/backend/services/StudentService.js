import mysql from "mysql";
import bcrypt from "bcrypt";
import { pool } from "../server.js";


export default class StudentService {
  constructor() {
    this.pool = pool;
  }

  async addStudent(body, res) {
    try {
      const { name, email, password } = JSON.parse(body);

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = "INSERT INTO elevi (nume, email, parola) VALUES (?, ?, ?)";
      this.pool.query(
        query,
        [name, email, hashedPassword],
        (error, results) => {
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
        }
      );
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  }

  async AddStudentToClass(body, res) {
    try {
      const { classId, studentId } = JSON.parse(body);

      const query = "INSERT INTO claseelevi (ClasaID, ElevID) VALUES (?, ?)";
      this.pool.query(query, [classId, studentId], (error, results) => {
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
  }

  async getStudentIdByName(body, res) {
    try {
      const { nume } = JSON.parse(body);

      if (!nume) {
        return sendErrorResponse(res, 400, "Name is required");
      }

      const query = "SELECT id FROM elevi WHERE nume = ?";
      this.pool.query(query, [nume], (error, results) => {
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
  }

  async getStudents(body, res) {
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
      this.pool.query(query, [GroupID], (error, results) => {
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

  async getStudentById(res, id) {
    this.pool.query(
      "SELECT nume FROM elevi WHERE ID = ?",
      [id],
      (error, results) => {
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
      }
    );
  }

  async deleteStudent(res, studentId) {
    const checkerQuery = "SELECT * FROM elevi WHERE ID = ?;";
    const updateVoturiQuery =
      "UPDATE voturi SET UtilizatorID = 22 WHERE UtilizatorID = ?;";
    const updateComentariiQuery =
      "UPDATE Comentarii SET elevID = 22 WHERE elevID = ?;";
    const deleteQuery = "DELETE FROM elevi WHERE ID = ?;";

    this.pool.query(checkerQuery, [studentId], (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Database error" }));
        return;
      }

      if (results.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "student not found" })
        );
        return;
      }

      this.pool.query(updateVoturiQuery, [studentId], (error) => {
        if (error) {
          console.error("Error updating voturi:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        this.pool.query(updateComentariiQuery, [studentId], (error) => {
          if (error) {
            console.error("Error updating comentarii:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
            return;
          }

          this.pool.query(deleteQuery, [studentId], (error) => {
            if (error) {
              console.error("Error deleting student:", error);
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
    });
  }
}
