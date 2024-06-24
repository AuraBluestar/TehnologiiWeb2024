import GradesService from "../services/GradesService.js";

export default class GradesController {
  constructor() {
    this.gradesService = new GradesService();
  }

  async AddGrade(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.gradesService.AddGrade(body, res);
    });
  }
  async getGradesByTeacher(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.gradesService.getGradesByTeacher(body, res);
    });
  }

  async getGradesByStudent(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.gradesService.getGradesByStudent(body, res);
    });
  }
}
