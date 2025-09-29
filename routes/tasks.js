const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTasksDueToday,
} = require("../controllers/tasksController");

router.get("/", auth, getTasks);
router.post("/", auth, addTask);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);
router.get("/due-today", auth, getTasksDueToday);

module.exports = router;
