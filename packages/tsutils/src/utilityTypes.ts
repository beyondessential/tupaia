export type ValueOf<T> = T extends Record<string | number | symbol, unknown> ? T[keyof T] : never;
