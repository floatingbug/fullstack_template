const express = require('express');
const config = require('./src/config');
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connect } = require('./src/db/mongo');
const errorMiddleware = require('./src/middlewares/error');
const cookieParser = require("cookie-parser");
const authRoutes = require('./src/modules/auth');
const userRoutes = require('./src/modules/user');
const accountRoutes = require("./src/modules/account");

async function start() {
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

    if(config.env === "production"){
        app.use(helmet(config.helmetConfig));
        app.use(cors(config.corsConfig.production));
        app.use(rateLimit(config.rateLimitConfig.global));
    }
    else{
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
