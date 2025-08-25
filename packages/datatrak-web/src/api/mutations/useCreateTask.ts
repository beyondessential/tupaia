import { DatatrakWebTaskChangeRequest, TaskStatus } from '@tupaia/types';
import { successToast, gaEvent } from '../../utils';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useDatabaseMutation } from '../../hooks/database';
import { DatatrakWebModelRegistry } from '../../types';

type Data = DatatrakWebTaskChangeRequest.ReqBody & {
  country_code: string;
};

export const useCreateTask = (onSuccess?: () => void) => {
  const { project, id: userId } = useCurrentUserContext();
  return useDatabaseMutation<void, Data, unknown>(
    async (models: DatatrakWebModelRegistry, data: Data) => {
      // Country code is not part of the task data, it's used for GA events
      const { country_code, ...rest } = data;
      const survey = await models.survey.findOne({ code: data.survey_code });
      const taskData = models.task.formatTaskChanges({
        ...rest,
        country_code,
        survey_id: survey.id,
      });
      if (taskData.due_date) {
        taskData.status = TaskStatus.to_do;
      }

      await models.wrapInTransaction(async transactingModels => {
        const task = await transactingModels.task.create(taskData);

        if (data.comment) {
          await task.addUserComment(data.comment, userId);
        }

        return task;
      });
    },
    {
      onSuccess: (_, variables) => {
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
