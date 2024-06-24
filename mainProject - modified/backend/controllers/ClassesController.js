import ClassesService from "../services/ClassesService.js";

export default class ClassesController {
  constructor() {
    this.classesService = new ClassesService();
  }

  async addClass(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.classesService.addClass(body, res);
    });
  }

  async searchClassesTeacher(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.classesService.searchClassesTeacher(body, res);
    });
  }

  async searchClassesStudent(req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      this.classesService.searchClassesStudent(body, res);
    });
  }

  async getAllGroupsForProfesor(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.classesService.getAllGroupsForProfesor(body, res);
    });
  }

  async getAllGroupsForStudent(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.classesService.getAllGroupsForStudent(body, res);
    });
  }

  async getGroupById(res, groupId) {
    await this.classesService.getGroupById(res, groupId);
  }

  async deleteGroup(res, groupId) {
    await this.classesService.deleteGroup(res, groupId);
  }
}
