import AuthController from "./controllers/AuthController.js";
import TeacherController from "./controllers/TeacherController.js";
import StudentController from "./controllers/StudentController.js";
import ProblemsController from "./controllers/ProblemsController.js";
import ClassesController from "./controllers/ClassesController.js";
import HomeworksController from "./controllers/HomeworksController.js";
import SolutionsController from "./controllers/SolutionsController.js";
import GradesController from "./controllers/GradesController.js";
import ReportsController from "./controllers/ReportsController.js";
import SubjectsController from "./controllers/SubjectsController.js";
import VotesController from "./controllers/VotesController.js";
import CommentsController from "./controllers/CommentsController.js";

//vezi ca s ar putea sa trebuiasca import cu {}

export default class Router {
  constructor() {
    this.authController = new AuthController();
    this.teacherController = new TeacherController();
    this.studentController = new StudentController();
    this.problemsController = new ProblemsController();
    this.classesController = new ClassesController();
    this.homeworksController = new HomeworksController();
    this.solutionsController = new SolutionsController();
    this.gradesController = new GradesController();
    this.reportsController = new ReportsController();
    this.subjectsController = new SubjectsController();
    this.votesController = new VotesController();
    this.commentsController = new CommentsController();
  }

  route(req, res) {
    console.log(req.method, req.url, "route");
    if (req.method === "POST") {
      if (req.url === "/addTeacher") {
        this.teacherController.addTeacher(req, res);
      } else if (req.url === "/login") {
        this.authController.login(req, res);
      } else if (req.url === "/addStudent") {
        this.studentController.addStudent(req, res);
      } else if (req.url === "/problems/add") {
        this.problemsController.addProblem(req, res);
      } else if (req.url === "/classes/add") {
        this.classesController.addClass(req, res);
      } else if (req.url === "/problems/all") {
        this.problemsController.getAllProblems(res);
      } else if (req.url === "/problems/pending") {
        this.problemsController.getAllPendingProblems(res);
      } else if (req.url === "/problems/search") {
        this.problemsController.searchProblems(req, res);
      } else if (req.url === "/problems/admin/search") {
        this.problemsController.searchProblemsAdmin(req, res);
      } else if (req.url === "/classes/search/Teacher") {
        this.classesController.searchClassesTeacher(req, res);
      } else if (req.url === "/classes/search/Student") {
        this.classesController.searchClassesStudent(req, res);
      } else if (req.url === "/classes/all/Teacher") {
        this.classesController.getAllGroupsForProfesor(req, res);
      } else if (req.url === "/classes/all/Student") {
        this.classesController.getAllGroupsForStudent(req, res);
      } else if (req.url === "/classes/addStudent") {
        this.studentController.AddStudentToClass(req, res);
      } else if (req.url === "/student/id") {
        this.studentController.getStudentIdByName(req, res);
      } else if (req.url === "/homeworks/teacher") {
        this.homeworksController.GetHomeworkByTeacher(req, res);
      } else if (req.url === "/homeworks/student") {
        this.homeworksController.GetHomeworkForStudent(req, res);
      } else if (req.url === "/problems/student") {
        this.problemsController.GetProblemForStudent(req, res);
      } else if (req.url === "/homework/add") {
        this.homeworksController.AddHomework(req, res);
      } else if (req.url === "/homework/addProblem") {
        this.homeworksController.AddProblemToHomework(req, res);
      } else if (req.url === "/solutions/add") {
        this.solutionsController.addSolution(req, res);
      } else if (req.url === "/solutions/student") {
        this.solutionsController.getSolutionsByStudent(req, res);
      } else if (req.url === "/solutions/teacher") {
        this.solutionsController.getSolutionsByTeacher(req, res);
      } else if (req.url === "/homeworks/checkProblem") {
        this.homeworksController.CheckProblemInHomework(req, res);
      } else if (req.url === "/homeworks/problems") {
        this.homeworksController.getProblemsByHomework(req, res);
      } else if (req.url === "/problems/approval") {
        this.problemsController.ProblemApproval(req, res);
      } else if (req.url === "/grades/add") {
        this.gradesController.AddGrade(req, res);
      } else if (req.url === "/grades/teacher") {
        this.gradesController.getGradesByTeacher(req, res);
      } else if (req.url === "/grades/student") {
        this.gradesController.getGradesByStudent(req, res);
      } else if (req.url === "/reports/user") {
        this.reportsController.getUserReports(req, res);
      } else if (req.url === "/reports/problem") {
        this.reportsController.getProblemReports(req, res);
      } else if (req.url === "/subjects") {
        this.subjectsController.getSubjectsByGroup(req, res);
      } else if (req.url === "/classes/students") {
        this.studentController.getStudents(req, res);
      } else if (req.url === "/votes/get") {
        this.votesController.getVotesForProblem(req, res);
      } else if (req.url === "/votes/add") {
        this.votesController.addVoteToProblem(req, res);
      } else if (req.url === "/getAccountDetails") {
        this.authController.getAccountDetails(req, res);
      } else if (req.url === "/updateAccountDetails") {
        this.authController.updateAccountDetails(req, res);
      } else if (req.url === "/comments/add") {
        this.commentsController.addComment(req, res);
      } else if (req.url.startsWith("/comments/")) {
        const commentId = req.url.split("/")[2];
        this.commentsController.getCommentsByProblemID(res, commentId);
      } else if (req.url.startsWith("/problems/")) {
        const problemId = req.url.split("/")[2];
        this.problemsController.getProblemById(res, problemId);
      } else if (req.url.startsWith("/Teacher/")) {
        const teacherId = req.url.split("/")[2];
        this.teacherController.getTeacherById(res, teacherId);
      } else if (req.url.startsWith("/student/")) {
        const studentId = req.url.split("/")[2];
        this.studentController.getStudentById(res, studentId);
      } else if (req.url.startsWith("/group/")) {
        const groupId = req.url.split("/")[2];
        this.classesController.getGroupById(res, groupId);
      }
    } else if (req.method === "DELETE") {
      if (req.url.startsWith("/ProfilProfesor")) {
        const teacherId = req.url.split("/")[2];
        this.teacherController.deleteTeacher(res, teacherId);
      } else if (req.url.startsWith("/ProfilStudent")) {
        const studentId = req.url.split("/")[2];
        this.studentController.deleteStudent(res, studentId);
      } else if (req.url.startsWith("/uniqueHWProfesor")) {
        const homeworkId = req.url.split("/")[2];
        this.homeworksController.deleteHomework(res, homeworkId);
      } else if (req.url.startsWith("/uniqueGroupProfesor")) {
        const groupId = req.url.split("/")[2];
        this.classesController.deleteGroup(res, groupId);
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Request Not Valid" }));
    }
  }
}
