import { useQueryClient } from '@tanstack/react-query';
import { Task } from '@tupaia/types';
import { put } from '../api';
import { successToast } from '../../utils';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useDatabaseMutation } from '../queries';
import { useIsOfflineFirst } from '../offlineFirst';
import { editTask } from '../../database';
import { DatatrakWebModelRegistry } from '../../types';
import { ensure } from '@tupaia/tsutils';

type PartialTask = Partial<Task>;

type LocalContext = { taskId?: Task['id'] };

const editRemoteTask = async ({
  taskId,
  data,
}: {
  models: DatatrakWebModelRegistry;
  taskId?: Task['id'];
  data: PartialTask;
}) => {
  return put(`tasks/${ensure(taskId)}`, {
    data,
  });
};

export const useEditTask = (taskId?: Task['id'], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { projectId } = useCurrentUserContext();
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseMutation<any, Error, PartialTask, unknown, LocalContext>(
    isOfflineFirst ? editTask : editRemoteTask,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['tasks', taskId]);
        queryClient.invalidateQueries(['taskMetric', projectId]);
        successToast('Task updated successfully');
        if (onSuccess) onSuccess();
      },
      localContext: {
        taskId,
      },
    },
  );
};
