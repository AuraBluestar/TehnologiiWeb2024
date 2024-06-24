import mysql from "mysql";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

export default class VotesService {
  constructor() {
    this.pool = pool;
  }

  async getVotesForProblem(body, res) {
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

      this.pool.query(query, [ProblemaID], (error, results) => {
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
  }

  async addVoteToProblem(body, res) {
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

      const checkQuery = `
          SELECT COUNT(*) AS count FROM voturi 
          WHERE ProblemaID = ? AND UtilizatorID = ?
        `;

      this.pool.query(
        checkQuery,
        [ProblemaID, UtilizatorID],
        (error, results) => {
          if (error) {
            console.error("Error checking data:", error.sqlMessage);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                message: "Database error",
                error: error.sqlMessage,
              })
            );
            return;
          }

          const count = results[0].count;

          if (count > 0) {
            const updateQuery = `
              UPDATE voturi 
              SET Stele = ?
              WHERE ProblemaID = ? AND UtilizatorID = ?
            `;

            this.pool.query(
              updateQuery,
              [Stele, ProblemaID, UtilizatorID],
              (error) => {
                if (error) {
                  console.error("Error updating data:", error.sqlMessage);
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
              }
            );
          } else {
            const insertQuery = `
              INSERT INTO voturi (ProblemaID, UtilizatorID, Stele)
              VALUES (?, ?, ?)
            `;

            this.pool.query(
              insertQuery,
              [ProblemaID, UtilizatorID, Stele],
              (error) => {
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
              }
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
}
