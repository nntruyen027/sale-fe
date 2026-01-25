export const toBoolean = (value) =>
    typeof value === 'string'
        ? value.toLowerCase().trim() === 'true'
        : Boolean(value);
