import type { ObjectId, OptionalId, WithId } from 'mongodb';

export interface UserDocument {
    _id?: ObjectId;
    name: string;
    email: string;
    pendingEmail: string | null;
    pendingEmailToken: string | null;
    pendingEmailExpiresAt: Date | null;
    password: string;
    emailVerified: boolean;
    emailTokenHash: string | null;
    emailTokenExpiresAt: Date | null;
    passwordResetTokenHash?: string | null;
    passwordResetExpiresAt?: Date | null;
    emailChangeLastRequestedAt?: Date | null;
    createdAt: Date;
}

export type NewUser = OptionalId<UserDocument>;

export type UserRecord = WithId<UserDocument>;

export interface PublicUser {
    id: string;
    name: string;
    email: string;
}

export interface UpdateChanges {
    name?: string;
    email?: string;
    password?: string;
}
