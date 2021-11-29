/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { put } from '../api';

export const useApproveSurveyResponseStatus = () =>
  useMutation(id => put(`survey-response/${id}`, { data: { status: 'approved' } }));

export const useRejectSurveyResponseStatus = () =>
  useMutation(id => put(`survey-response/${id}`, { data: { status: 'rejected' } }));
