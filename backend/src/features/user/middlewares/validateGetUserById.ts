import type { NextFunction, Request, Response } from 'express';
import { ObjectId } from '../../../db/mongo.js';

export default (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "User id is required.",
    });
  }

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid user id.",
    });
  }

  next();
};
