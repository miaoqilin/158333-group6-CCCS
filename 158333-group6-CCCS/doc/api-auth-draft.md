# Authentication API Draft

## Overview

This document describes the initial API design for the authentication system of the Campus Coffee and Catering Services Web Application.

The authentication module is responsible for:
- user registration
- user login
- retrieving user profile information
- updating user profile information

This document is part of the Week 1–2 backend planning.

---

# User Registration

Endpoint

POST /api/auth/register

Description

Create a new user account.

Request Example

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "123456"
}

Field Description

name  
User's full name

email  
User's email address

password  
User's password

Success Response Example

{
  "message": "User registered successfully",
  "user": {
    "id": "user_001",
    "name": "Alice",
    "email": "alice@example.com"
  }
}

Possible Errors

Email already exists

Invalid input data

---

# User Login

Endpoint

POST /api/auth/login

Description

Authenticate a user using email and password.

Request Example

{
  "email": "alice@example.com",
  "password": "123456"
}

Success Response Example

{
  "message": "Login successful",
  "token": "jwt_token_example",
  "user": {
    "id": "user_001",
    "name": "Alice",
    "email": "alice@example.com"
  }
}

Possible Errors

Invalid email or password

User not found

---

# Get User Profile

Endpoint

GET /api/users/profile

Description

Retrieve the profile information of the currently logged-in user.

Headers Example

Authorization: Bearer token

Success Response Example

{
  "id": "user_001",
  "name": "Alice",
  "email": "alice@example.com"
}

Possible Errors

Unauthorized access

Invalid token

---

# Update User Profile

Endpoint

PUT /api/users/profile

Description

Update the profile information of the logged-in user.

Request Example

{
  "name": "Alice Chen"
}

Success Response Example

{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_001",
    "name": "Alice Chen",
    "email": "alice@example.com"
  }
}

---

# Authentication Method

The system will use JSON Web Token (JWT) for authentication.

Authentication Flow

1 User logs in or registers  
2 Server generates a JWT token  
3 Client stores the token  
4 Client sends the token in request headers  
5 Server verifies the token before returning protected data

Example Header

Authorization: Bearer <token>

---

# Example User Model

{
  "id": "user_001",
  "name": "Alice",
  "email": "alice@example.com",
  "password": "hashed_password",
  "createdAt": "2026-03-16",
  "updatedAt": "2026-03-16"
}

---

# Notes

This document is an early API draft created during Week 1–2.

The API structure may change after the database schema and authentication implementation are completed.