import { DatatrakWebTaskChangeRequest, TaskStatus } from '@tupaia/types';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser } from '../../api';
import { AccessPolicy } from '@tupaia/access-policy';

type Data = DatatrakWebTaskChangeRequest.ReqBody & {
  country_code: string;
};

export const createTask = async ({
  models,
  accessPolicy,
  data,
  user,
}: {
  models: DatatrakWebModelRegistry;
  accessPolicy: AccessPolicy;
  data: Data;
  user: CurrentUser;
}) => {
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

  await models.task.assertUserHasPermissionToCreateTask(accessPolicy, taskData);

  return await models.wrapInTransaction(async transactingModels => {
    const task = await transactingModels.task.create(taskData);

    if (data.comment) {
      await task.addUserComment(data.comment, user.id);
    }

    return task;
  });
};
