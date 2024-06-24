import mysql from "mysql";
import bcrypt from "bcrypt";

export default class SubjectsService {
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

  async getSubjectsByGroup(body, res) {
    try {
      const { Grupa, ProfesorID } = JSON.parse(body);

      const query =
        "SELECT Materie FROM clase WHERE Grupa = ? And ProfesorID=? ";
      this.pool.query(query, [Grupa], [ProfesorID], (error, results) => {
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
  }
}
