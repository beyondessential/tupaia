/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { Entity } from '@tupaia/types';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { post } from '../api';
import { ROUTES } from '../../constants';
import { useUser } from '../queries';

type FormSubmitProps = Record<string, any> & {
  entityId: Entity['id'];
  startTime: string;
};
export const useSubmitSurvey = () => {
  const navigate = useNavigate();
  const { data: userData } = useUser();
  const { surveyCode } = useParams();

  return useMutation(
    (formData: FormSubmitProps) => {
      const { entityId, startTime, ...answers } = formData;

      // Save the  survey with the entityId from the entity question if it exists,
      // otherwise use the users country
      const surveyEntityId = entityId || userData?.country?.id;
      const endTime = new Date().toISOString();
      const timestamp = new Date().toISOString();

      const surveyResponse = {
        entityId: surveyEntityId,
        surveyCode: surveyCode,
        answers,
        timestamp,
        endTime,
        startTime,
      };
      return post('surveyResponse', { data: surveyResponse });
    },
    {
      onSuccess: () => {
        const path = generatePath(ROUTES.SURVEY_SUCCESS, { surveyCode });
        navigate(path);
      },
    },
  );
};
