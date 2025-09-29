const { sql, getPool } = require("../db");

exports.getTasks = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserId", sql.Int, req.user.userId)
      .query("SELECT * FROM Tasks WHERE UserId=@UserId ORDER BY DueDate");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

exports.addTask = async (req, res) => {
  const { title, description, dueDate, priority, status } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input("UserId", sql.Int, req.user.userId)
      .input("Title", sql.NVarChar, title)
      .input("Description", sql.NVarChar, description)
      .input("DueDate", sql.Date, dueDate)
      .input("Priority", sql.NVarChar, priority)
      .input("Status", sql.NVarChar, status)
      .query("INSERT INTO Tasks (UserId, Title, Description, DueDate, Priority, Status) VALUES (@UserId, @Title, @Description, @DueDate, @Priority, @Status)");
    res.status(201).json({ message: "Task added successfully ✅" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add task" });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, priority, status } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input("TaskId", sql.Int, id)
      .input("UserId", sql.Int, req.user.userId)
      .input("Title", sql.NVarChar, title)
      .input("Description", sql.NVarChar, description)
      .input("DueDate", sql.Date, dueDate)
      .input("Priority", sql.NVarChar, priority)
      .input("Status", sql.NVarChar, status)
      .query("UPDATE Tasks SET Title=@Title, Description=@Description, DueDate=@DueDate, Priority=@Priority, Status=@Status WHERE TaskId=@TaskId AND UserId=@UserId");
    res.json({ message: "Task updated ✅" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input("TaskId", sql.Int, id)
      .input("UserId", sql.Int, req.user.userId)
      .query("DELETE FROM Tasks WHERE TaskId=@TaskId AND UserId=@UserId");
    res.json({ message: "Task deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

exports.getTasksDueToday = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserId", sql.Int, req.user.userId)
      .execute("sp_GetTasksDueToday");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch today’s tasks" });
  }
};
