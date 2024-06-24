import mysql from "mysql";
import bcrypt from "bcrypt";

export default class GradesService {
  constructor() {
    this.dbConfig = {
      host: "informatix-informatix.h.aivencloud.com",
      user: "avnadmin",
      password: "AVNS_1u_r2mfq1FxPl9dd3yX",
      database: "defaultdb",
      port: 22933,
    };

    // Crearea unui pool de conexiuni MySQL
    this.pool = mysql.createPool(this.dbConfig);
  }

  async AddGrade(body, red) {
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
      this.pool.query(
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
  }
  async getGradesByTeacher(body, res) {
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
      this.pool.query(query, [ProfesorID], (error, results) => {
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
  }

  async getGradesByStudent(body, res) {
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
      this.pool.query(query, [ElevID], (error, results) => {
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
  }
}
