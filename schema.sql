-- Use or create database
CREATE DATABASE TMS;
GO
USE TMS;
GO

-- Users table
CREATE TABLE Users (
  UserId INT PRIMARY KEY IDENTITY(1,1),
  Name NVARCHAR(100),
  Email NVARCHAR(100) UNIQUE,
  PasswordHash NVARCHAR(255),
  CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tasks table
CREATE TABLE Tasks (
  TaskId INT PRIMARY KEY IDENTITY(1,1),
  UserId INT FOREIGN KEY REFERENCES Users(UserId),
  Title NVARCHAR(200),
  Description NVARCHAR(MAX),
  DueDate DATE,
  Priority NVARCHAR(20),
  Status NVARCHAR(20),
  CreatedAt DATETIME DEFAULT GETDATE()
);

-- Sample data (optional)
INSERT INTO Users (Name, Email, PasswordHash)
VALUES ('Test User', 'test@example.com', 'SOME_HASHED_PASSWORD');

INSERT INTO Tasks (UserId, Title, Description, DueDate, Priority, Status)
VALUES
(1, 'Complete Project Proposal', 'Write and submit the TMS project proposal', '2025-10-01', 'High', 'Pending'),
(1, 'Finish Angular Project v2', 'Updated task description', '2025-10-01', 'Medium', 'In Progress');
