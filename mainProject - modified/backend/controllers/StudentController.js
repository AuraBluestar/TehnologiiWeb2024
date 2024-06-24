import StudentService from "../services/StudentService.js";

export default class StudentController {
  constructor() {
    this.studentService = new StudentService();
  }

  async addStudent(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.studentService.addStudent(body, res);
    });
  }

  async AddStudentToClass(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.studentService.AddStudentToClass(body, res);
    });
  }

  async getStudentIdByName(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.studentService.getStudentIdByName(body, res);
    });
  }

  async getStudents(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.studentService.getStudents(body, res);
    });
  }

  async getStudentById(res, studentID) {
    await this.studentService.getStudentById(res, studentID);
  }

  async deleteStudent(res, studentID) {
    await this.studentService.deleteStudent(res, studentID);
  }
}
