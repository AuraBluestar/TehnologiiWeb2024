import ReportsService from "../services/ReportsService.js";

export default class ReportsController {
  constructor() {
    this.reportsService = new ReportsService();
  }

  async getUserReports(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.reportsService.getUserReports(body, res);
    });
  }

  async getProblemReports(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.reportsService.getProblemReports(body, res);
    });
  }
}
