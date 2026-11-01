import config from '../../../config/index.js';
import models from '../models/index.js';
import { AppError } from '../../../types/errors.js';
import { signToken, verifyToken } from '../../../utils/jwt.js';

const EXPIRED_SESSION = new AppError(401, 'Session expired. Please sign in again.');

export default async ({ refreshToken }: { refreshToken: string | undefined }) => {
    let decoded;

    try {
        decoded = verifyToken(refreshToken as string, config.jwtRefreshSecret);
    }
    catch {
        throw EXPIRED_SESSION;
    }

    // The user may have been deleted or unverified since the token was issued.
    const user = await models.findById({ userId: decoded.id });

    if (!user || !user.emailVerified) {
        throw EXPIRED_SESSION;
    }

    const accessToken = await signToken(
        { id: decoded.id },
        config.jwtAccessSecret,
        config.accessTokenExpiresIn,
    );

    return { accessToken };
};
