/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

// TODO: Switch to 'Awaited' when upgrading to typescript 4.5+
export type Resolved<T> = T extends Promise<infer R> ? R : T;
