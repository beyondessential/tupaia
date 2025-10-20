/** @example '2025-09-25T01:35:59.000Z' */
export type ISO8601Timestamp = `${string}-${string}-${string}T${string}:${string}:${string}`;

/** @example '2025-09-25 13:35:59' */
export type ISO9075Timestamp = `${string}-${string}-${string} ${string}:${string}:${string}`;
