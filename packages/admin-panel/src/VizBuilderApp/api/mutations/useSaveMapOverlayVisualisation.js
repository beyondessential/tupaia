/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from '@tanstack/react-query';
import { post, put } from '../api';

export const useSaveMapOverlayVisualisation = config =>
  useMutation(
    ['mapOverlayVisualisation', config],
    () => {
      if (config.id) {
        return put(`mapOverlayVisualisation/${config.id}`, {
          data: { visualisation: config },
        });
      }
      return post('mapOverlayVisualisation', {
        data: { visualisation: config },
      });
    },
    {
      throwOnError: true,
    },
  );
