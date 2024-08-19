/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { getTempDirectory } from './getTempDirectory';

export const getExportPathForUser = (userId: string) => getTempDirectory(`exports/${userId}`);
