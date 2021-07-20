/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { post } from '../api';

const testData = {
  foo: 'bar',
};

export const useSaveViz = () => {
  return useMutation(() =>
    post('save', {
      data: testData,
    }),
  );
};
