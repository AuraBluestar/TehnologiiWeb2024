import ProblemsService from "../services/ProblemsService.js";

export default class ProblemsController {
  constructor() {
    this.problemsService = new ProblemsService();
  }

  async addProblem(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.problemsService.addProblem(body, res);
    });
  }

  async getAllProblems(res) {
    await this.problemsService.getAllProblems(res);
  }

  async getAllPendingProblems(res) {
    await this.problemsService.getAllPendingProblems(res);
  }

  async searchProblems(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.problemsService.searchProblems(body, res);
    });
  }

  async searchProblemsAdmin(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.problemsService.searchProblemsAdmin(body, res);
    });
  }

  async GetProblemForStudent(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.problemsService.GetProblemForStudent(body, res);
    });
  }

  async ProblemApproval(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.problemsService.ProblemApproval(body, res);
    });
  }

  async getProblemById(res, problemId) {
    await this.problemsService.getProblemById(res, problemId);
  }
}
