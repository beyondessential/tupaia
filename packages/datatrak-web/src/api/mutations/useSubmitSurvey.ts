/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { Entity } from '@tupaia/types';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { post } from '../api';
import { ROUTES } from '../../constants';

type FormSubmitProps = Record<string, any> & {
  entity: Entity['id'];
};
export const useSubmitSurvey = () => {
  const navigate = useNavigate();
  const { surveyCode } = useParams();

  return useMutation(
    (formData: FormSubmitProps) => {
      const { entityId, ...answers } = formData;
      const surveyResponse = {
        entity: entityId,
        survey: surveyCode,
        timestamp: new Date(),
        answers,
      };
      console.log('submit form', surveyResponse);
      return post('surveyResponse', { data: surveyResponse });
    },
    {
      onSuccess: () => {
        console.log('success');
        const path = generatePath(ROUTES.SURVEY_SUCCESS, { surveyCode });
        navigate(path);
      },
    },
  );
};
