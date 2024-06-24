import mysql from "mysql";
import bcrypt from "bcrypt";

export default class AuthService {
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

  async login(body, res) {
    try {
      const { username, password } = JSON.parse(body);
      console.log("Username:", username);
      console.log("Password:", password);

      const queryStudent = "SELECT id, parola FROM elevi WHERE nume = ?";
      this.pool.query(queryStudent, [username], async (error, results) => {
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

        this.pool.query(queryTeacher, [username], async (error, results) => {
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
          this.pool.query(queryAdmin, [username], (error, results) => {
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
  }

  async getAccountDetails(body, res) {
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
      this.pool.query(query, [id], (error, results) => {
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
  }

  async updateAccountDetails(body, res) {
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

      this.pool.query(query, [hashedPassword, id], (error, results) => {
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
  }
}
