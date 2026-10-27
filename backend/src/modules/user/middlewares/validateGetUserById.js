const { ObjectId } = require("../../../db/mongo");

module.exports = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "User id is required."
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid user id."
    });
  }

  next();
};
