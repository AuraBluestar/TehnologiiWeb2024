import SubjectsService from "../services/SubjectsService.js";

export default class SubjectsController {
  constructor() {
    this.subjectsService = new SubjectsService();
  }

  async getSubjectsByGroup(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.subjectsService.getSubjectsByGroup(body, res);
    });
  }
}
