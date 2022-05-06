/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { getTempDirectory } from '../../utilities';

export const getExportPathForUser = userId => getTempDirectory(`exports/${userId}`);
