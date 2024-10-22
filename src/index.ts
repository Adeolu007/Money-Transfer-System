
// import express, { Request, Response } from 'express';
// import { AppDataSource } from './Database/data-source';
// import dotenv from 'dotenv';
// import transactionRoutes from './api/routes/transactionRoutes';
// import authRoutes from './api/routes/authRoutes';
// import userRoutes from './api/routes/userRoutes';
// import { connect } from './api/helpers/redisClient';
// import 'reflect-metadata';
// import { authJwt } from './api/helpers/authJwt'
// import swaggerUi from 'swagger-ui-express';
// import swaggerSpec from './swaggerConfig';

// const app = express();
// dotenv.config();

// AppDataSource.initialize()
//     .then(async () => {
//         await connect();

//         app.use(express.json());
//         app.use(authJwt());

//         app.use('/api/transactions', transactionRoutes);
//         app.use('/api', authRoutes);
//         app.use('/api', userRoutes);

//         const PORT = process.env.PORT || 3000;
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     })
//     .catch((error) => {
//         console.error('Error during Data Source initialization:', error);
//     });
//     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// export { app };
import express, { Request, Response } from 'express';
import { AppDataSource } from './Database/data-source';
import dotenv from 'dotenv';
import transactionRoutes from './api/routes/transactionRoutes';
import authRoutes from './api/routes/authRoutes';
import userRoutes from './api/routes/userRoutes';
import { connect } from './api/helpers/redisClient';
import 'reflect-metadata';
import { authJwt } from './api/helpers/authJwt';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig'; // Make sure this imports your Swagger configuration

const app = express();
dotenv.config();

AppDataSource.initialize()
    .then(async () => {
        await connect();
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        app.use(express.json());
        app.use(authJwt());

        // Route handlers
        app.use('/api/transactions', transactionRoutes);
        app.use('/api', authRoutes);
        app.use('/api', userRoutes);

        // Swagger documentation
       

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error during Data Source initialization:', error);
    });

export { app };
