import crypto from 'node:crypto';
import model from '../models/index.js';
import { AppError } from '../../../types/errors.js';

export default async ({ token }: { token: string }) => {
  const emailTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await model.findByEmailToken({ emailTokenHash });

  if (!user) {
    throw new AppError(400, "Invalid or expired verification token");
  }
  if (user.emailVerified) {
    return true; // repeated click on the link: already verified
  }
  if (user.emailTokenExpiresAt === null || user.emailTokenExpiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired verification token");
  }

  await model.verifyEmail({ userId: String(user._id) });
  return true;
};
