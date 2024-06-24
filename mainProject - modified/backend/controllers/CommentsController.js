import CommentsService from "../services/CommentsService.js";

export default class CommentsController {
  constructor() {
    this.commentsService = new CommentsService();
  }

  async addComment(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      await this.commentsService.addComment(body, res);
    });
  }

  async getCommentsByProblemID(res, problemID) {
    await this.commentsService.getCommentsByProblemID(res, problemID);
  }
}
