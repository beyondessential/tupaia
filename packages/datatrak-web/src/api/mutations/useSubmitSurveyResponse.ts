import { useQueryClient } from '@tanstack/react-query';
import { generatePath, useNavigate, useParams } from 'react-router';

import { SurveyResponseModel, UserModel } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { DatatrakWebSubmitSurveyResponseRequest, Entity, Survey, UserAccount } from '@tupaia/types';
import { getBrowserTimeZone } from '@tupaia/utils';

import { post, useCurrentUserContext, useEntityByCode } from '..';
import { useShowCoconutsPigs } from '../queries';
import { Coconut } from '../../components';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { gaEvent, successToast } from '../../utils';
import { useIsOfflineFirst } from '../offlineFirst';
import { useSurvey } from '../queries';
import {
  ContextualMutationFunctionContext,
  useDatabaseMutation,
} from '../queries/useDatabaseMutation';
import { DatatrakWebModelRegistry } from '../../types';
import { useDeleteSurveyResponseDraft } from './useDeleteSurveyResponseDraft';

type Answer = string | number | boolean | null | undefined;

export interface AnswersT {
  [key: string]: Answer;
}

interface ResponseData {
  countryId: Entity['id'] | undefined;
  questions: ReturnType<typeof getAllSurveyComponents>;
  startTime: string | undefined;
  surveyId: Survey['id'] | undefined;
  timezone: Intl.ResolvedDateTimeFormatOptions['timeZone'];
  userId: UserAccount['id'] | null;
}

// utility hook for getting survey response data
export const useSurveyResponseData = (): ResponseData => {
  const user = useCurrentUserContext();
  const { surveyCode, countryCode } = useParams();
  const { surveyStartTime, surveyScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);
  const timezone = getBrowserTimeZone();
  return {
    startTime: surveyStartTime,
    surveyId: survey?.id,
    questions: getAllSurveyComponents(surveyScreens), // flattened array of survey questions
    countryId: country?.id,
    // Let mutation function assign public user if not logged in
    userId: user.isLoggedIn ? ensure(user.id) : null,
    timezone,
  };
};

interface SurveyResponseMutationFunctionContext
  extends ContextualMutationFunctionContext<{
    answers?: AnswersT;
  }> { }

const createEntityParentChildRelation = async (
  transactingModels: DatatrakWebModelRegistry,
  entityHierarchyId: string,
  entitiesUpserted: Entity[],
) => {
  const entitiesWithParent = entitiesUpserted.filter(
    (entity): entity is Entity & { parent_id: string } => typeof entity.parent_id === 'string',
  );
  const relations = entitiesWithParent.map(entity => ({
    entity_hierarchy_id: entityHierarchyId,
    parent_id: entity.parent_id,
    child_id: entity.id,
  }));
  if (relations.length === 0) { 
    return; 
  }

  // Re-parenting should replace existing links for each child in this hierarchy.
  // Without this, stale rows can leave the same child under both old and new parents.
  const childIds = [...new Set(relations.map(({ child_id }) => child_id))];
  await transactingModels.entityParentChildRelation.delete({
    entity_hierarchy_id: entityHierarchyId,
    child_id: childIds,
  });

  await transactingModels.entityParentChildRelation.createMany(relations, {
    onConflictIgnore: ['entity_hierarchy_id', 'parent_id', 'child_id'],
  });
};

export const useSubmitSurveyResponse = (from: string | undefined) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { resetForm, draftId } = useSurveyForm();
  const user = useCurrentUserContext();
  const { data: survey } = useSurvey(params.surveyCode);
  const surveyResponseData = useSurveyResponseData();
  const isOfflineFirst = useIsOfflineFirst();
  const { showCoconutsPigs } = useShowCoconutsPigs();
  const deleteDraft = useDeleteSurveyResponseDraft(draftId);

  const mutationFunctions = {
    local: async ({ data: answers, models, user }: SurveyResponseMutationFunctionContext) => {
      if (!answers) return;

      // TODO: Assert user has access

      return await models.wrapInRepeatableReadTransaction(async transactingModels => {
        const submitterId = user.isLoggedIn
          ? ensure(user.id)
          : (await transactingModels.user.findPublicUser({ columns: ['id'] })).id;

        const data = {
          ...surveyResponseData,
          answers,
          userId: submitterId,
        };

        // Mirroring datatrak-web-server logic
        const { qr_codes_to_create, recent_entities, ...processedResponse } =
          await SurveyResponseModel.processSurveyResponse(
            transactingModels,
            data as DatatrakWebSubmitSurveyResponseRequest.ReqBody,
          );

        // Mirroring central-server logic
        await SurveyResponseModel.upsertEntitiesAndOptions(transactingModels, [processedResponse]);

        // On central, EntityHierarchyCacher rebuilds entity_parent_child_relation when an entity
        // changes. That change handler doesn't run locally, so insert the parent-child link here
        // so the new entity is immediately visible in descendant queries.
        const entityHierarchyId = user.project?.entityHierarchyId;
        const entitiesUpserted = processedResponse.entities_upserted ?? [];
        if (entityHierarchyId && entitiesUpserted.length > 0) {
          await createEntityParentChildRelation(transactingModels, entityHierarchyId, entitiesUpserted);
        }

        await SurveyResponseModel.validateSurveyResponses(transactingModels, [processedResponse]);
        const idsCreated = await SurveyResponseModel.saveResponsesToDatabase(
          transactingModels,
          submitterId,
          [processedResponse],
        );

        if (user.isLoggedIn) {
          await UserModel.addRecentEntities(transactingModels, submitterId, recent_entities);
        }

        const [{ surveyResponseId }] = idsCreated;
        await transactingModels.task.completeTaskForSurveyResponse({
          ...processedResponse,
          id: surveyResponseId,
        });

        // Marking any corresponding task as complete is delegated to central-server

        return { qrCodeEntitiesCreated: qr_codes_to_create };
      });
    },
    remote: async ({ data: answers }: SurveyResponseMutationFunctionContext) => {
      if (!answers) return;
      const data = { ...surveyResponseData, answers };
      return await post('submitSurveyResponse', { data });
    },
  };

  return useDatabaseMutation<any, Error, AnswersT, unknown>(
    isOfflineFirst ? mutationFunctions.local : mutationFunctions.remote,
    {
      onMutate: () => {
        // Send off survey submissions by survey, project, country, and userId
        gaEvent('submit_survey', params.surveyCode!, survey?.name);
        gaEvent('submit_survey_by_project', user.project?.code!);
        gaEvent('submit_survey_by_country', params.countryCode!);
        gaEvent('submit_survey_by_user', user.id!);
      },
      onSuccess: data => {
        queryClient.invalidateQueries(['entityDescendants']); // Refresh recent entities
        queryClient.invalidateQueries(['leaderboard']);
        queryClient.invalidateQueries(['recentSurveys']);
        queryClient.invalidateQueries(['rewards']);
        queryClient.invalidateQueries(['surveyResponses']);
        queryClient.invalidateQueries(['taskMetric', user.projectId]);
        queryClient.invalidateQueries(['tasks']);
        // Delete the draft if one was being resumed
        if (draftId) {
          deleteDraft.mutate();
        }

        // Invalidate optionSet queries for questions that have createNew enabled so that the new
        // options are fetched
        const createNewAutocompleteQuestions = surveyResponseData?.questions?.filter(
          question => question?.config?.autocomplete?.createNew,
        );
        if (createNewAutocompleteQuestions?.length > 0) {
          for (const question of createNewAutocompleteQuestions) {
            queryClient.invalidateQueries(['autocompleteOptions', question.optionSetId]);
          }
        }

        resetForm();
        if (showCoconutsPigs) {
          successToast('Congratulations! You’ve earned a coconut', Coconut);
        } else {
          successToast('Survey submitted successfully');
        }
        // include the survey response data in the location state, so that we can use it to generate QR codes
        navigate(generatePath(ROUTES.SURVEY_SUCCESS, params), {
          state: {
            ...(from && { from }),
            surveyResponse: JSON.stringify(data),
          },
        });
      },
    },
  );
};
