import AuthController from "./controllers/AuthController.js";
import TeacherController from "./controllers/TeacherController.js";
import StudentController from "./controllers/StudentController.js";
import ProblemsController from "./controllers/ProblemsController.js";
import ClassesController from "./controllers/ClassesController.js";
import HomeworksController from "./controllers/HomeworksController.js";
import SolutionsController from "./controllers/SolutionsController.js";
import GradesService from "./services/GradesService.js";
import ReportsService from "./services/ReportsService.js";
import SubjectsService from "./services/SubjectsService.js";
import VotesService from "./services/VotesService.js";
import CommentsService from "./services/CommentsService.js";
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
    this.gradesService = new GradesService();
    this.reportsService = new ReportsService();
    this.subjectsService = new SubjectsService();
    this.votesService = new VotesService();
    this.commentsService = new CommentsService();
  }

  route(req, res) {
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
        this.gradesService.AddGrade(req, res);
      } else if (req.url === "/grades/teacher") {
        this.gradesService.getGradesByTeacher(req, res);
      } else if (req.url === "/grades/student") {
        this.gradesService.getGradesByStudent(req, res);
      } else if (req.url === "/reports/user") {
        this.reportsService.getUserReports(req, res);
      } else if (req.url === "/reports/problem") {
        this.reportsService.getProblemReports(req, res);
      } else if (req.url === "/subjects") {
        this.subjectsService.getSubjectsByGroup(req, res);
      } else if (req.url === "/classes/students") {
        this.studentController.getStudents(req, res);
      } else if (req.url === "/votes/get") {
        this.votesService.getVotesForProblem(req, res);
      } else if (req.url === "/votes/add") {
        this.votesService.addVoteToProblem(req, res);
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
      if (pathname.startsWith("/ProfilProfesor")) {
        const teacherId = pathname.split("/")[2];
        this.teacherController.deleteTeacher(res, teacherId);
      } else if (pathname.startsWith("/ProfilStudent")) {
        const studentId = pathname.split("/")[2];
        this.studentController.deleteStudent(res, studentId);
      } else if (pathname.startsWith("/uniqueHWProfesor")) {
        const homeworkId = pathname.split("/")[2];
        this.homeworksController.deleteHomework(res, homeworkId);
      } else if (pathname.startsWith("/uniqueGroupProfesor")) {
        const groupId = pathname.split("/")[2];
        deleteGroup(res, groupId);
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Request Not Valid" }));
    }
  }
}
