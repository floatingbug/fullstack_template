import config from '../../../config/index.js';
import model from '../models/index.js';
import password from '../../../utils/password.js';
import normalize from '../../../utils/normalize.js';
import { AppError } from '../../../types/errors.js';
import { signToken } from '../../../utils/jwt.js';

const { comparePassword } = password;
const { normalizeEmail, normalizeName } = normalize;

export default async ({ nameOrEmail, password }: { nameOrEmail: string; password: string }) => {
    let user;

    // Check if nameOrEmail is email
    if (nameOrEmail.includes("@")){
        user = await model.findByEmail({ email: normalizeEmail(nameOrEmail) });
    }
    else{
        user = await model.findByName({ name: normalizeName(nameOrEmail) });
    }

    if (!user){
        throw new AppError(401, "Invalid credentials");
    }

    if (!user.emailVerified) {
        throw new AppError(403, "Please verify your email address first.");
    }

    const correctPassword = await comparePassword(password, user.password);

    if (!correctPassword){
        throw new AppError(401, "Invalid credentials");
    }

    const accessToken = await signToken(
        { id: String(user._id) },
        config.jwtAccessSecret,
        config.accessTokenExpiresIn,
    );

    const refreshToken = await signToken(
        { id: String(user._id) },
        config.jwtRefreshSecret,
        config.refreshTokenExpiresIn,
    );

    return {
        user: {
            id: String(user._id),
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};
