import models from '../../models/index.js';
import changeEmail from './changeEmail.js';
import password from '../../../../utils/password.js';
import { isDuplicateKeyError } from '../../../../types/errors.js';
import type { UpdateChanges } from '../../../../types/user.js';

const { hashPassword } = password;

interface UpdateAccountResult {
    messages: Record<string, string>;
    errorMessages: Record<string, string>;
    updated: string[];
}

export default async ({ userId, changes }: { userId: string; changes: UpdateChanges }): Promise<UpdateAccountResult> => {
    const messages: Record<string, string> = {};
    const errorMessages: Record<string, string> = {};
    const updated: string[] = [];

    if (changes.name !== undefined) {
        try {
            const result = await models.updateName({
                newName: changes.name,
                userId,
            });

            if (result.matchedCount === 0) {
                errorMessages.name = "User not found";
            }
            else if (result.modifiedCount === 0) {
                errorMessages.name = "Name is identical to the current one.";
            }
            else {
                messages.name = "Name has been changed.";
                updated.push("name");
            }
        }
        catch (err) {
            if (isDuplicateKeyError(err)) {
                errorMessages.name = "Name is already taken.";
            }
            else {
                throw err;
            }
        }
    }

    if (changes.email !== undefined) {
        const changeEmailResult = await changeEmail({
            userId,
            email: changes.email,
        });

        if (!changeEmailResult.success) {
            errorMessages.email = changeEmailResult.message;
        }
        else {
            messages.email = changeEmailResult.message;
            updated.push("email");
        }
    }

    if (changes.password !== undefined) {
        const passwordHash = await hashPassword(changes.password);

        const updatePasswordResult = await models.updatePassword({
            newPassword: passwordHash,
            userId,
        });

        if (updatePasswordResult.matchedCount === 0) {
            errorMessages.password = "User not found";
        }
        else {
            messages.password = "Password has been changed.";
            updated.push("password");
        }
    }

    return { messages, errorMessages, updated };
};
