import { DatatrakWebTaskChangeRequest, TaskStatus } from '@tupaia/types';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser } from '../../api';
import { AccessPolicy, assertBESAdminAccess, assertAnyPermissions } from '@tupaia/access-policy';

type Data = DatatrakWebTaskChangeRequest.ReqBody & {
  country_code: string;
};

export const createTask = async ({
  models,
  data,
  user,
  assertPermissions,
}: {
  models: DatatrakWebModelRegistry;
  data: Data;
  user?: CurrentUser;
  assertPermissions: (assertion: (accessPolicy: AccessPolicy) => Promise<boolean>) => Promise<void>;
}) => {
  const createPermissionChecker = accessPolicy =>
    models.task.assertUserHasPermissionToCreateTask(accessPolicy, data);
  assertPermissions(assertAnyPermissions([assertBESAdminAccess, createPermissionChecker]));

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

  return await models.wrapInTransaction(async transactingModels => {
    const task = await transactingModels.task.create(taskData);

    if (data.comment) {
      await task.addUserComment(data.comment, user?.id);
    }

    return task;
  });
};
