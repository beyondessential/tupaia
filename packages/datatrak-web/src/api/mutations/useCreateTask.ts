import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatatrakWebTaskChangeRequest } from '@tupaia/types';
import { post } from '../api';
import { successToast, gaEvent } from '../../utils';
import { useCurrentUserContext } from '../CurrentUserContext';

type Data = DatatrakWebTaskChangeRequest.ReqBody & {
  country_code: string;
};

export const useCreateTask = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { projectId, project } = useCurrentUserContext();
  return useMutation<any, Error, Data, unknown>(
    (data: Data) => {
      // Country code is not part of the task data, it's used for GA events
      const { country_code, ...rest } = data;
      return post('tasks', {
        data: rest,
      });
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['taskMetric', projectId]);
        successToast('Task successfully created');
        // Send off GA events
        gaEvent('task_created_by_project', project?.code!);
        gaEvent('task_created_by_country', variables.country_code);
        gaEvent('task_created_by_survey', variables.survey_code);
        gaEvent('task_created', 'Task created');

        if (onSuccess) onSuccess();
      },
    },
  );
};
