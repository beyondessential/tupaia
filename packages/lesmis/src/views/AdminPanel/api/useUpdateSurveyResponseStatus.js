import { useMutation } from '@tanstack/react-query';

export const useApproveSurveyResponseStatus = api =>
  useMutation(id => api.post(`surveyResponse/${id}/resubmit`, {}, { approval_status: 'approved' }));

export const useRejectSurveyResponseStatus = api =>
  useMutation(id => api.post(`surveyResponse/${id}/resubmit`, {}, { approval_status: 'rejected' }));
