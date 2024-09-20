/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from '@tanstack/react-query';
import { API_URL, post } from '../api';
import download from 'downloadjs';

// Requests a survey response PDF export from the server, and returns the response
export const useExportSurveyResponse = (surveyResponseId: string) => {
  return useMutation<any, Error, unknown, unknown>(
    () => {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`export/${surveyResponseId}`, {
        responseType: 'blob',
        data: {
          cookieDomain,
          baseUrl,
        },
      });
    },
    {
      onSuccess: data => {
        download(data, `survey_response_${surveyResponseId}.pdf`);
      },
    },
  );
};
