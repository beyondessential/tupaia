import { useMutation } from '@tanstack/react-query';
import { upload } from '../api';

// Must match the file name expected by the back-end
const FILE_NAME = 'testData';

export const useUploadTestData = () =>
  useMutation(['uploadTestData'], file => upload('uploadTestData', {}, FILE_NAME, file));
