import mysql from "mysql";
import bcrypt from "bcrypt";

export default class ReportsService {
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

  async getUserReports(body, res) {
    try {
      const { UserID, userType } = JSON.parse(body);

      if (!UserID || !userType) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "UserID and userType are required",
          })
        );
        return;
      }

      if (userType === "elev") {
        const query = `
            SELECT 
              (SELECT COUNT(DISTINCT problemaId) 
               FROM problemeteme pe 
               JOIN teme t ON t.id=pe.temaID 
               JOIN clase c ON c.id=t.clasaid 
               JOIN claseelevi ce ON ce.clasaid=c.id 
               JOIN elevi e ON e.id=ce.elevid 
               WHERE e.id = ?) AS problems_assigned,
              (SELECT COUNT(DISTINCT pe.problemaid) 
               FROM problemeteme pe 
               JOIN teme t ON t.id = pe.temaid 
               JOIN clase c ON c.id = t.clasaid 
               JOIN claseelevi ce ON ce.clasaid = c.id 
               JOIN elevi e ON e.id = ce.elevid 
               JOIN rezolvari r ON r.elevid = e.id AND r.problemaid = pe.problemaid 
               WHERE e.id = ?) AS problems_solved,
              (SELECT COUNT(DISTINCT pe.problemaid) 
               FROM problemeteme pe 
               JOIN teme t ON t.id = pe.temaid 
               JOIN clase c ON c.id = t.clasaid 
               JOIN claseelevi ce ON ce.clasaid = c.id 
               JOIN elevi e ON e.id = ce.elevid 
               JOIN rezolvari r ON r.elevid = e.id AND r.problemaid = pe.problemaid 
               JOIN note n ON e.id=n.elevid AND n.problemaid=pe.problemaid AND n.valoare>=5
               WHERE e.id = ?) AS problems_solved_correctly
          `;
        this.pool.query(query, [UserID, UserID, UserID], (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results[0]));
          }
        });
      } else if (userType === "profesor") {
        const query = `
            select (SELECT COUNT(r.ID) FROM rezolvari r JOIN 
            problemeteme pt ON r.ProblemaID = pt.ProblemaID 
            JOIN teme t ON pt.TemaID = t.ID WHERE t.ProfesorID 
            = ?) AS ProblemeDeCorectat, (SELECT COUNT(n.ID)  
            FROM note n WHERE n.ProfesorID = ?) AS ProblemeCorectate;
          `;
        this.pool.query(query, [UserID, UserID], (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Database error" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results[0]));
          }
        });
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Invalid userType" })
        );
      }
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  }

  async getProblemReports(body, res) {
    try {
      console.log("Input to JSON.parse:", body);
      const { ProblemID } = JSON.parse(body);

      if (!ProblemID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "ProblemID is required" })
        );
        return;
      }

      const query = `
          SELECT 
            (SELECT COUNT(*) FROM rezolvari WHERE ProblemaID = ?) AS users_tried,
            (SELECT COUNT(*)
            FROM rezolvari r
            JOIN note n ON n.ProblemaID = r.ProblemaID AND n.valoare >= 5
            WHERE r.ProblemaID = 11) AS users_succeeded;
        `;
      this.pool.query(query, [ProblemID, ProblemID], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Database error" })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results[0]));
        }
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  }
}
