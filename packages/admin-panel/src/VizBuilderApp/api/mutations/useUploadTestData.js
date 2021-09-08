/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { upload } from '../api';

// Must match the file name expected by the back-end
const FILE_NAME = 'testData';

export const useUploadTestData = () =>
  useMutation('uploadTestData', file => upload('uploadTestData', {}, FILE_NAME, file));
