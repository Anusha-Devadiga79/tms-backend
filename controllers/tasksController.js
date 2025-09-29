const { sql, getPool } = require("../db");

// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserId", sql.Int, req.user.userId)
      .query("SELECT * FROM Tasks WHERE UserId=@UserId ORDER BY DueDate");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Add new task
exports.addTask = async (req, res) => {
  console.log(req.body); // Debug log
  const { Title, Description, DueDate, Priority, Status } = req.body;

  if (!Title || !DueDate) {
    return res.status(400).json({ error: "Title and DueDate are required" });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input("UserId", sql.Int, req.user.userId)
      .input("Title", sql.NVarChar, Title)
      .input("Description", sql.NVarChar, Description || '')
      .input("DueDate", sql.Date, DueDate)
      .input("Priority", sql.NVarChar, Priority || 'Low')
      .input("Status", sql.NVarChar, Status || 'Pending')
      .query(`
        INSERT INTO Tasks (UserId, Title, Description, DueDate, Priority, Status)
        VALUES (@UserId, @Title, @Description, @DueDate, @Priority, @Status)
      `);
    res.status(201).json({ message: "Task added successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add task" });
  }
};

// Update existing task
exports.updateTask = async (req, res) => {
  console.log(req.body); // Debug log
  const { id } = req.params;
  const { Title, Description, DueDate, Priority, Status } = req.body;

  if (!Title || !DueDate) {
    return res.status(400).json({ error: "Title and DueDate are required" });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input("TaskId", sql.Int, id)
      .input("UserId", sql.Int, req.user.userId)
      .input("Title", sql.NVarChar, Title)
      .input("Description", sql.NVarChar, Description || '')
      .input("DueDate", sql.Date, DueDate)
      .input("Priority", sql.NVarChar, Priority || 'Low')
      .input("Status", sql.NVarChar, Status || 'Pending')
      .query(`
        UPDATE Tasks
        SET Title=@Title, Description=@Description, DueDate=@DueDate, Priority=@Priority, Status=@Status
        WHERE TaskId=@TaskId AND UserId=@UserId
      `);
    res.json({ message: "Task updated ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// Delete task
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
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

// Get tasks due today
exports.getTasksDueToday = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserId", sql.Int, req.user.userId)
      .execute("sp_GetTasksDueToday");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today’s tasks" });
  }
};
