import mysql from "mysql";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

export default class TeacherService {
  constructor() {
    this.pool = pool;
  }

  async addTeacher(body, res) {
    try {
      const { name, email, password } = JSON.parse(body);

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query =
        "INSERT INTO profesori (nume, email, parola) VALUES (?, ?, ?)";

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
              JSON.stringify({
                success: true,
                userType: "profesor",
                id: userId,
              })
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

  async getTeacherById(res, id) {
    this.pool.query(
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

  async deleteTeacher(res, teacherId) {
    console.log("Deleting teacher with ID:", teacherId);
    const checkerQuery = "SELECT * FROM profesori WHERE ID = ?;";
    const deleteQuery = "DELETE FROM profesori WHERE ID = ?;";

    this.pool.query(checkerQuery, [teacherId], (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Database error" }));
        return;
      }

      if (results.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Teacher not found" })
        );
        return;
      }

      this.pool.query(deleteQuery, [teacherId], (error) => {
        if (error) {
          console.error("Error deleting teacher:", error);
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
  }
}
