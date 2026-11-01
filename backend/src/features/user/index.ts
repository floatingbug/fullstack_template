import express from 'express';
import controller from './controller/index.js';
import authUser from '../../middlewares/authUser.js';
import { openApiMiddleware } from '../../middlewares/openapi.js';
import middlewares from './middlewares/index.js';

const { validateGetUserById } = middlewares;

const router = express.Router();

router.get('/me', authUser, ...openApiMiddleware, controller.getUser);
router.delete("/me", authUser, ...openApiMiddleware, controller.deleteUser);

router.get('/:id', validateGetUserById, ...openApiMiddleware, controller.getUserById);

export default router;
