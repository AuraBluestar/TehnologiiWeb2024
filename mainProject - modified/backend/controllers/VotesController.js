import VotesService from "../services/VotesService.js";

export default class VotesController {
  constructor() {
    this.votesService = new VotesService();
  }

  async getVotesForProblem(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.votesService.getVotesForProblem(body, res);
    });
  }

  async addVoteToProblem(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.votesService.addVoteToProblem(body, res);
    });
  }
}
