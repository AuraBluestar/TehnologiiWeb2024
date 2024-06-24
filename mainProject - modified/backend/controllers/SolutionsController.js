import SolutionsService from "../services/SolutionsService.js";

export default class SolutionsController {
  constructor() {
    this.solutionsService = new SolutionsService();
  }

  async addSolution(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.solutionsService.addSolution(body, res);
    });
  }

  async getSolutionsByStudent(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.solutionsService.getSolutionsByStudent(body, res);
    });
  }

  async getSolutionsByTeacher(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.solutionsService.getSolutionsByTeacher(body, res);
    });
  }
}
