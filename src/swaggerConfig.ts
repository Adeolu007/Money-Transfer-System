

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Money Transfer System',
      version: '1.0.0',
      description: `
        This API provides endpoints for managing a money transfer system. 
        It allows users to register, log in, initiate transfers, and view transaction history. 
        The API supports user authentication and utilizes JSON Web Tokens (JWT) for secure access. 
        Users can manage their accounts and perform transactions efficiently, 
        ensuring a seamless experience for sending and receiving money. 
  
        Features:
        - User registration and authentication
        - Money transfer between users
        - Transaction history retrieval
        - Balance management
        - Admin functionality for user management (if applicable)
  
        Security:
        - All endpoints require JWT authorization, except for registration and login.
        - Sensitive operations are protected to ensure user data integrity and security.
      `,
      contact: {
        name: 'Adeolu Odunuyi',
        email: 'odunuyiadeolu@gmail.com',
      },
  },
  servers: [
    {
      url: 'http://localhost:3000', 
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/api/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
