import HomeworksService from "../services/HomeworksService.js";

export default class HomeworksController {
  constructor() {
    this.homeworksService = new HomeworksService();
  }

  async GetHomeworkByTeacher(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.GetHomeworkByTeacher(body, res);
    });
  }

  async GetHomeworkForStudent(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.GetHomeworkForStudent(body, res);
    });
  }

  async AddHomework(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.AddHomework(body, res);
    });
  }

  async AddProblemToHomework(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.AddProblemToHomework(body, res);
    });
  }

  async CheckProblemInHomework(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.CheckProblemInHomework(body, res);
    });
  }

  async getProblemsByHomework(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.getProblemsByHomework(body, res);
    });
  }

  async deleteProblemFromHomework(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.homeworksService.deleteProblemFromHomework(body, res);
    });
  }

  async deleteHomework(res, homeworkId) {
    await this.homeworksService.deleteHomework(res, homeworkId);
  }
}
