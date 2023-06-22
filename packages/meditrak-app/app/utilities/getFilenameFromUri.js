/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const getFilenameFromUri = uri => uri ? uri.substring(uri.lastIndexOf('/') + 1) : null;
