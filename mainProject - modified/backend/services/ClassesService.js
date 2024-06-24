import mysql from "mysql";
import bcrypt from "bcrypt";

export default class ClassesService {
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

  async addClass(body, res) {
    try {
      const { grupa, profesorID, materie } = JSON.parse(body);

      const query =
        "INSERT INTO clase (Grupa, ProfesorID, Materie) VALUES (?, ?, ?)";
      this.pool.query(query, [grupa, profesorID, materie], (error, results) => {
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
  }

  async searchClassesTeacher(body, res) {
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

  async searchClassesStudent(body, res) {
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

  async getAllGroupsForProfesor(body, res) {
    try {
      const { profesorID } = JSON.parse(body);

      // Verificare dacă profesorID este furnizat
      if (!profesorID) {
        return sendErrorResponse(res, 400, "ProfesorID is required");
      }

      // Interogare pentru a obține toate clasele pentru profesorul dat
      const query = "SELECT Materie, Grupa, Id FROM clase WHERE ProfesorID = ?";
      this.pool.query(query, [profesorID], (error, results) => {
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
  }

  async getAllGroupsForStudent(body, res) {
    try {
      const { elevID } = JSON.parse(body);

      // Verificare dacă elevID este furnizat
      if (!elevID) {
        return sendErrorResponse(res, 400, "ElevID is required");
      }

      // Interogare pentru a obține toate clasele pentru profesorul dat
      const query =
        "SELECT distinct Materie, Grupa, clase.ID FROM clase join claseelevi on clase.ID=claseelevi.ClasaID WHERE ElevID = ?";
      this.pool.query(query, [elevID], (error, results) => {
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
  }

  async getGroupById(res, id) {
    const query =
      "SELECT CONCAT(Grupa, '-', Materie) AS 'Grupa-Materie', ProfesorID FROM clase WHERE ID = ?";
    this.pool.query(query, [id], (error, results) => {
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

  async deleteGroup(res, groupId) {
    const checkerQuery = "SELECT * FROM clase WHERE ID = ?;";
    const hwProblemsQuery = "SELECT ID FROM teme WHERE ClasaID = ?;";
    const deleteProblemsQuery = "DELETE FROM problemeteme WHERE TemaID = ?;";
    const deleteRelatedTemeQuery = "DELETE FROM teme WHERE ClasaID = ?;";
    const deleteRelatedClaseQuery = "DELETE FROM claseelevi WHERE ClasaID = ?;";
    const deleteQuery = "DELETE FROM clase WHERE ID = ?;";

    this.pool.query(checkerQuery, [groupId], (error, results) => {
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

      this.pool.query(hwProblemsQuery, [groupId], (error, results) => {
        if (error) {
          console.error("Error querying homework problems:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
          return;
        }

        const homeworkIds = results.map((row) => row.ID);

        const deleteProblemsPromises = homeworkIds.map((homeworkId) => {
          return new Promise((resolve, reject) => {
            this.pool.query(deleteProblemsQuery, [homeworkId], (error) => {
              if (error) {
                return reject(error);
              }
              resolve();
            });
          });
        });

        Promise.all(deleteProblemsPromises)
          .then(() => {
            this.pool.query(deleteRelatedTemeQuery, [groupId], (error) => {
              if (error) {
                console.error("Error deleting related homeworks:", error);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ success: false, message: "Database error" })
                );
                return;
              }

              this.pool.query(deleteRelatedClaseQuery, [groupId], (error) => {
                if (error) {
                  console.error("Error deleting related class records:", error);
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      success: false,
                      message: "Database error",
                    })
                  );
                  return;
                }

                this.pool.query(deleteQuery, [groupId], (error) => {
                  if (error) {
                    console.error("Error deleting group:", error);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(
                      JSON.stringify({
                        success: false,
                        message: "Database error",
                      })
                    );
                    return;
                  }

                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: true }));
                });
              });
            });
          })
          .catch((error) => {
            console.error("Error deleting related problems:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          });
      });
    });
  }
}
