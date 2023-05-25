/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export function createBasicHeader(username: string, password: string): string {
    // TODO: Replace with @tupaia/utils createBasicHeader() when we unpublish
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}
