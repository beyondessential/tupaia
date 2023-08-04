/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';

export const useApproveSurveyResponseStatus = api =>
  useMutation(id => api.put(`surveyResponses/${id}`, {}, { approval_status: 'approved' }));

export const useRejectSurveyResponseStatus = api =>
  useMutation(id => api.put(`surveyResponses/${id}`, {}, { approval_status: 'rejected' }));
