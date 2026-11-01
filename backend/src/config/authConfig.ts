const authConfig = {
    passwordResetExpiresIn: 15 * 60 * 1000,
};

export type AuthConfig = typeof authConfig;

export default authConfig;
