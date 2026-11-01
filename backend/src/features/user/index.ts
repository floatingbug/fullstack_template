import express from 'express';
import controller from './controller/index.js';
import authUser from '../../middlewares/authUser.js';
import middlewares from './middlewares/index.js';

const { validateGetUserById } = middlewares;

const router = express.Router();

router.get('/me', authUser, controller.getUser);
router.delete("/me", authUser, controller.deleteUser);

router.get('/:id', validateGetUserById, controller.getUserById);

export default router;
