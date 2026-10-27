const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 50;
const NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

function normalizeEmail(value) {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim().toLowerCase();
}

function normalizeName(value) {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim();
}

/**
 * Prüft einen Anzeigenamen. Gibt eine Fehlermeldung zurück oder null.
 */
function validateName(name) {
    if (typeof name !== "string") {
        return "Name must be a string";
    }

    const trimmed = normalizeName(name);

    if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
        return `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`;
    }

    if (!NAME_PATTERN.test(trimmed)) {
        return "Name may only contain letters, numbers, dots, underscores or hyphens";
    }

    return null;
}

module.exports = {
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH,
    NAME_PATTERN,
    normalizeEmail,
    normalizeName,
    validateName,
};
