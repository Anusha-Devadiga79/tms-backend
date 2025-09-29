---

# Task Management System - Backend

This is the **Express + MSSQL backend** for the Task Management System (TMS).
It provides REST APIs for user authentication and task management.

---

## **Features**

* User Registration (Name, Email, Password)
* User Login with JWT-based authentication
* Task Management:

  * Add, Edit, Delete tasks
  * View tasks for logged-in users
* Middleware for JWT authentication
* Error handling (400, 401, 500)
* Built with Express, Node.js, and MSSQL

---

## **Database (MSSQL)**

### **.env Configuration**

```env
DB_USER=anusha
DB_PASSWORD=bcca
DB_SERVER=localhost
DB_DATABASE=TMS
JWT_SECRET=your_secret_key
```

### **Tables**

**1. Users**

| Column       | Type          | Notes                      |
| ------------ | ------------- | -------------------------- |
| UserId       | INT           | PRIMARY KEY, IDENTITY(1,1) |
| Name         | NVARCHAR(100) |                            |
| Email        | NVARCHAR(100) | UNIQUE                     |
| PasswordHash | NVARCHAR(255) |                            |
| CreatedAt    | DATETIME      | DEFAULT GETDATE()          |

**2. Tasks**

| Column      | Type          | Notes                                |
| ----------- | ------------- | ------------------------------------ |
| TaskId      | INT           | PRIMARY KEY, IDENTITY(1,1)           |
| UserId      | INT           | FOREIGN KEY REFERENCES Users(UserId) |
| Title       | NVARCHAR(200) |                                      |
| Description | NVARCHAR(MAX) |                                      |
| DueDate     | DATE          |                                      |
| Priority    | NVARCHAR(20)  | Low / Medium / High                  |
| Status      | NVARCHAR(20)  | Pending / In Progress / Completed    |
| CreatedAt   | DATETIME      | DEFAULT GETDATE()                    |

### **Sample Data**

```sql
-- Users
INSERT INTO Users (Name, Email, PasswordHash)
VALUES ('Test User', 'test@example.com', 'SOME_HASHED_PASSWORD');

-- Tasks
INSERT INTO Tasks (UserId, Title, Description, DueDate, Priority, Status)
VALUES
(1, 'Complete Project Proposal', 'Write and submit the TMS project proposal', '2025-10-01', 'High', 'Pending'),
(1, 'Finish Angular Project v2', 'Updated task description', '2025-10-01', 'Medium', 'In Progress');
```

---

## **Project Structure**

```
tms-backend/
├── server.js
├── routes/
│   ├── auth.js
│   └── tasks.js
├── middleware/
│   └── auth.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
└── database/
    └── dbConfig.js
```

---

## **Setup Instructions**

1. Clone the repository:

```bash
git clone https://github.com/Anusha-Devadiga79/tms-backend.git
cd tms-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create the database using `schema.sql` (provided).

4. Set environment variables in `.env` (as shown above).

5. Run the backend server:

```bash
node server.js
```

6. API endpoints:

```
POST   /register        - Register a new user
POST   /login           - Login and get JWT token
GET    /tasks           - Get tasks for logged-in user
POST   /tasks           - Add new task
PUT    /tasks/:id       - Update task
DELETE /tasks/:id       - Delete task
```

---

## **Links**

* Frontend Repository: [tms-frontend](https://github.com/Anusha-Devadiga79/tms-frontend)
* SQL Script: `schema.sql`

---
