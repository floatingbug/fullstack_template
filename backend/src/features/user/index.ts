import express from 'express';
import controller from './controller/index.js';
import authUser from '../../middlewares/authUser.js';
import { openApiMiddleware } from '../../middlewares/openapi.js';

const router = express.Router();

router.get('/me', authUser, ...openApiMiddleware, controller.getUser);
router.delete("/me", authUser, ...openApiMiddleware, controller.deleteUser);

export default router;
