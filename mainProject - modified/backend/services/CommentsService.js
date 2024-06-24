import mysql from "mysql";
import bcrypt from "bcrypt";

export default class CommentsService {
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

  async addComment(body, res) {
    try {
      const { elevID, problemaID, comentariu } = JSON.parse(body);

      if (!elevID || !problemaID || !comentariu) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Missing required fields",
          })
        );
        return;
      }

      const insertQuery = `
          INSERT INTO Comentarii (elevID, problemaID, comentariu)
          VALUES (?, ?, ?)
        `;

      this.pool.query(
        insertQuery,
        [elevID, problemaID, comentariu],
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
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  }

  async getCommentsByProblemID(res, problemaID) {
    if (!problemaID) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: "Missing problemaID",
        })
      );
      return;
    }

    const query = `
        SELECT elevID, comentariu FROM Comentarii
        WHERE problemaID = ?
      `;

    this.pool.query(query, [problemaID], (error, results) => {
      if (error) {
        console.error("Error fetching data:", error.sqlMessage);
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
        res.end(JSON.stringify({ success: true, data: results }));
      }
    });
  }
}
