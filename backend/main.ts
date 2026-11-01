import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './src/config/index.js';
import { connect } from './src/db/mongo.js';
import errorMiddleware from './src/middlewares/error.js';
import authRoutes from './src/features/auth/index.js';
import userRoutes from './src/features/user/index.js';
import accountRoutes from './src/features/account/index.js';

async function start(): Promise<void> {
    await connect();

    const app = express();

    app.use(express.json(config.jsonConfig));
    app.use(express.urlencoded(config.urlencodedConfig));
    app.use(cookieParser());

    // Express 5 leaves req.body undefined when no body was parsed.
    // Validators can rely on a plain object instead of crashing.
    app.use((req, res, next) => {
        if (req.body === undefined || req.body === null) {
            req.body = {};
        }

        next();
    });

    if (config.env === "production") {
        app.use(helmet(config.helmetConfig));
        app.use(cors(config.corsConfig.production));
        app.use(rateLimit(config.rateLimitConfig.global));
    }
    else {
        app.use(cors(config.corsConfig.develop));
    }

    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/account', accountRoutes);

    app.use((req, res) => {
        res.status(404).json({ message: 'Not found' });
    });

    app.use(errorMiddleware);

    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
}

start();
