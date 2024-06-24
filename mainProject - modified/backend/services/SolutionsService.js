import mysql from "mysql";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

export default class SolutionsService {
  constructor() {
    this.pool = pool;
  }

  async addSolution(body, res) {
    try {
      const { ProblemaID, ElevID, ProfesorID, Rezolvare } = JSON.parse(body);

      // Verificarea validității datelor
      if (!ProblemaID || !ElevID || !ProfesorID || !Rezolvare) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Missing required fields" })
        );
        return;
      }

      const query =
        "INSERT INTO rezolvari (ProblemaID, ElevID, ProfesorID, Rezolvare) VALUES (?, ?, ?, ?)";
      this.pool.query(
        query,
        [ProblemaID, ElevID, ProfesorID, Rezolvare],
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
            const solutionId = results.insertId;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: solutionId }));
          }
        }
      );
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  }

  async getSolutionsByStudent(body, res) {
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
          SELECT distinct t.ProfesorID, ce.ClasaID, r.Rezolvare
          FROM claseelevi ce
          JOIN teme t ON ce.ClasaID = t.ClasaID
          JOIN problemeteme pt ON t.ID = pt.TemaID
          JOIN rezolvari r ON pt.ProblemaID = r.ProblemaID AND ce.ElevID = r.ElevID
          WHERE ce.ElevID = ? AND pt.ProblemaID = ?;`;

      this.pool.query(query, [elevID, problemaID], (error, results) => {
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

  async getSolutionsByTeacher(body, res) {
    try {
      const { profesorID, problemaID } = JSON.parse(body);

      if (!profesorID || !problemaID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "profesorID and problemaID are required",
          })
        );
        return;
      }

      const query = `
          SELECT claseelevi.ClasaID, claseelevi.ElevID, rezolvari.Rezolvare
          FROM claseelevi
          JOIN teme ON claseelevi.ClasaID = teme.ClasaID
          JOIN problemeteme ON teme.ID = problemeteme.TemaID
          JOIN rezolvari ON problemeteme.ProblemaID = rezolvari.ProblemaID AND claseelevi.ElevID = rezolvari.ElevID
          WHERE problemeteme.ProblemaID = ? AND teme.ProfesorID = ?;`;

      this.pool.query(query, [problemaID, profesorID], (error, results) => {
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
}
