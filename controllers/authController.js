const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, getPool } = require("../db");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const pool = await getPool();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("Name", sql.NVarChar, name)
      .input("Email", sql.NVarChar, email)
      .input("PasswordHash", sql.NVarChar, hashedPassword)
      .query("INSERT INTO Users (Name, Email, PasswordHash) VALUES (@Name, @Email, @PasswordHash)");

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email=@Email");

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.UserId }, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.json({ message: "Login successful ✅", token, user: { id: user.UserId, name: user.Name, email: user.Email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
