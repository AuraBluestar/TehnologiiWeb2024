import mysql from "mysql";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

export default class HomeworksService {
  constructor() {
    this.pool = pool;
  }

  async GetHomeworkByTeacher(body, res) {
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

      this.pool.query(query, [profesorID], (error, results) => {
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
  async GetHomeworkForStudent(body, res) {
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

  async AddHomework(body, res) {
    try {
      const { ClasaID, ProfesorID } = JSON.parse(body);

      const insertQuery =
        "INSERT INTO teme (ClasaID, ProfesorID) VALUES (?, ?)";
      this.pool.query(
        insertQuery,
        [ClasaID, ProfesorID],
        (insertError, insertResults) => {
          if (insertError) {
            console.error("Error inserting data:", insertError);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          } else {
            const homeworkId = insertResults.insertId;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: homeworkId }));
          }
        }
      );
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  }

  async AddProblemToHomework(body, res) {
    try {
      const { HomeworkID, ProblemID } = JSON.parse(body);

      const query =
        "INSERT INTO problemeteme (TemaID, ProblemaID) VALUES (?, ?)";
      this.pool.query(query, [HomeworkID, ProblemID], (error, results) => {
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
  }

  async CheckProblemInHomework(body, res) {
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

      this.pool.query(query, [elevID, problemaID], (error, results) => {
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
  }

  async getProblemsByHomework(body, res) {
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
      this.pool.query(query, [temaID], (error, results) => {
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

  async deleteHomework(res, homeworkId) {
    const checkerQuery = "SELECT * FROM teme WHERE ID = ?;";
    const deleteProblemsQuery = "DELETE FROM problemeteme WHERE TemaID = ?;";
    const deleteQuery = "DELETE FROM teme WHERE ID = ?;";

    this.pool.query(checkerQuery, [homeworkId], (error, results) => {
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

      this.pool.query(deleteProblemsQuery, [homeworkId], (error) => {
        if (error) {
          console.error("Error deleting related problems:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        this.pool.query(deleteQuery, [homeworkId], (error) => {
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
  }
}
