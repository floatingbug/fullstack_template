const { Router } = require('express');
const controller = require('./controller');
const authUser = require('../../middlewares/authUser');
const {validateGetUserById} = require("./middlewares");

const router = Router();

router.get('/me', authUser, controller.getUser);
router.delete("/me", authUser, controller.deleteUser);

router.get('/:id', validateGetUserById, controller.getUserById);

module.exports = router;
