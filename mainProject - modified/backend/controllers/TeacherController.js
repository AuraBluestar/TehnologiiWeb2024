import TeacherService from "../services/TeacherService.js";

export default class TeacherController {
  constructor() {
    this.teacherService = new TeacherService();
  }

  async addTeacher(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.teacherService.addTeacher(body, res);
    });
  }

  async getTeacherById(res, teacherID) {
    await this.teacherService.getTeacherById(res, teacherID);
  }

  async deleteTeacher(res, teacherID) {
    await this.teacherService.deleteTeacher(res, teacherID);
  }
}
