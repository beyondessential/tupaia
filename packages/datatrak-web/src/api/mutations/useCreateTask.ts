import { useQueryClient } from '@tanstack/react-query';
import { DatatrakWebTaskChangeRequest } from '@tupaia/types';

import { createTask } from '../../database/task';
import { gaEvent, successToast } from '../../utils';
import { post } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';

type Data = DatatrakWebTaskChangeRequest.ReqBody & {
  country_code: string;
};
const createRemote = async ({ data }: { data: Data }) => {
  const { country_code: _, ...rest } = data;
  return await post('tasks', {
    data: rest,
  });
};

export const useCreateTask = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { projectId, project } = useCurrentUserContext();

  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseMutation<any, Error, Data, unknown>(
    isOfflineFirst ? createTask : createRemote,
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
