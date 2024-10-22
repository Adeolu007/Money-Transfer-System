**Money Transfer System**  

**Overview**  

The Money Transfer System is a web application that allows users to create accounts, log in, and transfer money between accounts securely. This application is built with TypeScript and Express.js, utilizing a PostgreSQL database for data persistence.

**Features**  

User registration and authentication
Money transfer between users
Transaction history retrieval
Password management
Caching with Redis

**Technologies Used**  

TypeScript
Node.js
Express.js
PostgreSQL
Redis
JWT for authentication

**Setup Instructions**  

**Prerequisites**  

Node.js (v14 or later)
PostgreSQL (v12 or later)
Redis
Git

**Installation Step**  

**Clone the Repository**  

git clone https://github.com/Adeolu007/Money-Transfer-System.git
cd Money-Transfer-System

**Install Dependencies**  

Install the required packages using npm:
npm install

**Set Up Environment Variables**  

Create a .env file in the root of your project and add the following variables:
PORT=3000  

JWTSecret=your_jwt_secret  

DB_HOST=localhost  

DB_PORT=5432  

DB_USERNAME=your_db_username  

DB_PASSWORD=your_db_password  

DB_DATABASE=your_db_name  

REDIS_URL=redis://localhost:6379  


**Set Up Database**  

Make sure PostgreSQL is running, then create the database specified in your .env file.
createdb your_db_name

**Run Migrations**  

TypeORM for database migrations

npm run typeorm migration:run

**Start the Application**  

Start the server:
npm run start

Your application should now be running on http://localhost:3000.

**API Documentation**  

**User Endpoints**  

**Register a User**  

**Endpoint:** POST /api/register  

**Request Body:**  

json  

{
  "email": "user@example.com",
  "username": "user123",
  "password": "securePassword",
  "firstName": "John",
  "lastName": "Doe"
}  

**Response:**  

json  

{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "username": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "accountNumber": "202478123456",
    "accountBal": 0
  },  
  
  "token": "your_jwt_token"
}  

**Log In a User**  

**Endpoint:** POST /api/login  

**Request Body:**  

json  

{
  "email": "user@example.com",
  "password": "securePassword"
}  

**Response:**  

json  

{
  "message": "Successfully logged in",
  "token": "your_jwt_token",
  "userDetails": {
    "email": "user@example.com",
    "username": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "accountNumber": "202478123456",
    "accountBal": 0
  }
}

**Change User Password**  

**Endpoint:** PUT /api/change-password/:id  

**Request Body:**  

json  

{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword"
}

**Retrieve User by ID**  

**Endpoint:** GET /api/users/:id  

**Response:**  

json  

{
  "email": "user@example.com",
  "username": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "accountNumber": "202478123456",
  "accountBal": 0
}

**Retrieve All Users**  

**Endpoint:** GET /api/users  

**Response:**    

[
{
  "email": "user@example.com",
    "username": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "accountNumber": "202478123456",
    "accountBal": 0
  },
  ...
]

]  

**Transaction Endpoints**  

**Initiate a Money Transfer**  

**Endpoint**: POST /api/transfer  


**Request Body:**  

json  

{
  "senderId": "1",
  "receiverId": "2",
  "amount": 100,
  "name": "Transfer Name"
}  

**Response:**  

json  

{
  "msg": "Transfer completed successfully",
  "transaction": {
    "id": "1",
    "amount": 100,
    "balance": 900,
    "status": "completed",
    "transactionStatus": "successful",
    "accountNumber": "202478654321",
    "name": "Transfer Name"
  }
}

**List User Transfers**  

**Endpoint:** GET /api/transfers?page=1&pageSize=10  

**Response:**  

json  

{
  "transfers": [
    {
      "id": "1",
      "amount": 100,
      "balance": 900,
      "status": "completed",
      "transactionStatus": "successful",
      "createdAt": "2024-10-21T12:00:00Z"
    },
    ...  
    
  ],
  "total": 20,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}  

**Send Money from Counter**  

**Endpoint:** POST /api/sendFromCounter  

**Request Body:**  

json  

{
  "receiverId": "2",
  "amount": 50,
  "name": "Counter Transfer"
}

**Get Transfer History**  

**Endpoint:** GET /api/transfer-history/:userId  

**Response:**  

json  

[
  {
    "id": "1",
    "amount": 100,
    "balance": 900,
    "status": "completed",
    "transactionStatus": "successful",
    "createdAt": "2024-10-21T12:00:00Z"
  },
  ...
]

