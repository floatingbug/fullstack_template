export class AppError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

export function isDuplicateKeyError(err: unknown): boolean {
    return (
        typeof err === 'object'
        && err !== null
        && 'code' in err
        && (err as { code?: unknown }).code === 11000
    );
}

export function isHttpError(err: unknown): err is { status: number; message?: unknown } {
    return (
        typeof err === 'object'
        && err !== null
        && 'status' in err
        && typeof (err as { status?: unknown }).status === 'number'
    );
}
