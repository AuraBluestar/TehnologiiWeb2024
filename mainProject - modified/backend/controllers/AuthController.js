import AuthService from "../services/AuthService.js";

export default class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.authService.login(body, res);
    });
  }

  async getAccountDetails(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.authService.getAccountDetails(body, res);
    });
  }

  async updateAccountDetails(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.authService.updateAccountDetails(body, res);
    });
  }
}
