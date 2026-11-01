const crypto = require("crypto");
const model = require("../models");

module.exports = async ({ token }) => {
  const emailTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await model.findByEmailToken({ emailTokenHash });

  if (!user) {
    throw { status: 400, message: "Invalid or expired verification token" };
  }
  if (user.emailVerified) {
    return true; // repeated click on the link: already verified
  }
  if (user.emailTokenExpiresAt < new Date()) {
    throw { status: 400, message: "Invalid or expired verification token" };
  }

  await model.verifyEmail({ userId: user._id });
  return true;
};
