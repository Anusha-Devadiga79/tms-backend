const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  user: 'anusha',
  password: 'bcca',
  server: 'localhost',
  database: 'TMS',
  options: { encrypt: false, trustServerCertificate: true }
};

// Connect to DB
sql.connect(dbConfig)
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Connection Error:", err));

// Middleware to verify token and extract userId
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = user.id; // add userId to request
    next();
  });
}

// REGISTER
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const hash = await bcrypt.hash(password, 10);
    const existingUser = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;

    if (existingUser.recordset.length > 0) {
      await sql.query`UPDATE Users SET PasswordHash = ${hash} WHERE Email = ${email}`;
      return res.json({ message: "Password updated successfully" });
    }

    await sql.query`INSERT INTO Users (Name, Email, PasswordHash, CreatedAt) VALUES (${name}, ${email}, ${hash}, GETDATE())`;
    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// LOGIN
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
    if (result.recordset.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.UserId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ 
      token, 
      userId: user.UserId,  
      name: user.Name,      
      email: user.Email     
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET tasks
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Tasks WHERE UserId = ${req.userId} ORDER BY DueDate ASC`;
    res.json(result.recordset);
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ADD new task
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { Title, Description, DueDate, Priority, Status } = req.body;

    if (!Title || !DueDate) 
      return res.status(400).json({ message: "Title and Due Date are required" });

    const dueDateObj = new Date(DueDate);
    if (isNaN(dueDateObj)) 
      return res.status(400).json({ message: "Invalid Due Date" });

    await sql.query`
      INSERT INTO Tasks (UserId, Title, Description, DueDate, Priority, Status)
      VALUES (${req.userId}, ${Title}, ${Description || ''}, ${dueDateObj}, ${Priority || 'Low'}, ${Status || 'Pending'})
    `;

    const newTask = await sql.query`SELECT TOP 1 * FROM Tasks ORDER BY TaskId DESC`;
    res.status(201).json(newTask.recordset[0]);

  } catch (err) {
    console.error("Add Task Error:", err, req.body);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// UPDATE task
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, Description, DueDate, Priority, Status } = req.body;

    if (!Title || !DueDate) 
      return res.status(400).json({ message: "Title and Due Date are required" });

    const dueDateObj = new Date(DueDate);
    if (isNaN(dueDateObj))
      return res.status(400).json({ message: "Invalid Due Date" });

    await sql.query`
      UPDATE Tasks SET
        Title = ${Title},
        Description = ${Description || ''},
        DueDate = ${dueDateObj},
        Priority = ${Priority || 'Low'},
        Status = ${Status || 'Pending'}
      WHERE TaskId = ${id} AND UserId = ${req.userId}
    `;

    const updatedTask = await sql.query`SELECT * FROM Tasks WHERE TaskId = ${id}`;
    res.json(updatedTask.recordset[0]);

  } catch (err) {
    console.error("Update Task Error:", err, req.body);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE task
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await sql.query`DELETE FROM Tasks WHERE TaskId = ${id} AND UserId = ${req.userId}`;
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete Task Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
