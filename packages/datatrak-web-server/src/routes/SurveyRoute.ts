import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import {
  DatatrakWebSurveyRequest,
  WebServerProjectRequest,
  Question,
  QuestionType,
} from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';

export interface SurveyRequest
  extends Request<
    DatatrakWebSurveyRequest.Params,
    DatatrakWebSurveyRequest.ResBody,
    DatatrakWebSurveyRequest.ReqBody,
    DatatrakWebSurveyRequest.ReqQuery
  > {}

const DEFAULT_FIELDS = [
  'name',
  'code',
  'id',
  'can_repeat',
  'survey_group.name',
  'project_id',
  'surveyQuestions',
] as const;

const parseOption = (option: string) => {
  try {
    const parsedOption = JSON.parse(option!);
    if (!parsedOption.value) {
      // Valid JSON but not a valid option object, e.g. '50'
      throw new Error('Options defined as an object must contain the value key at minimum');
    }
    return parsedOption;
  } catch (e) {
    if (typeof option === 'string')
      return {
        label: option,
        value: option,
      };
    return option;
  }
};

const formatComponent = (component: any) => {
  const {
    question,
    validationCriteria,
    visibilityCriteria,
    config,
    detailLabel,
    questionText,
    ...restOfComponent
  } = component;
  const { options, detail, text } = question;

  // parse stringified fields
  const formattedComponent = {
    ...restOfComponent,
    // include the component and the question fields all in one object
    ...question,
    questionId: question.id,
    text: questionText || text, // on some occasions, the screen component overrides the question text with the field question_text
    detailLabel: detailLabel || detail, // on some occasions, the screen component overrides the question detail with the field detail_label
    validationCriteria: validationCriteria ? JSON.parse(validationCriteria) : null,
    visibilityCriteria: visibilityCriteria ? JSON.parse(visibilityCriteria) : null,
    config: config ? JSON.parse(config) : null,
    options: options.map(parseOption),
    componentId: component.id,
  };
  return formattedComponent;
};

export class SurveyRoute extends Route<SurveyRequest> {
  public async buildResponse() {
    const {
      ctx,
      query = {},
      params: { surveyCode },
      models,
    } = this.req;
    const { fields = DEFAULT_FIELDS } = query;
    // check if survey exists in the database
    const dbSurveyResults = await models.survey.find({ code: surveyCode });

    if (!dbSurveyResults.length) throw new Error(`Survey with code ${surveyCode} not found`);

    // check if user has access to survey
    const surveys = await ctx.services.central.fetchResources('surveys', {
      filter: { code: surveyCode },
      columns: fields,
    });

    if (!surveys.length)
      throw new PermissionsError(
        'You do not have access to this survey. If you think this is a mistake, please contact your system administrator.',
      );

    const survey = camelcaseKeys(surveys[0], { deep: true });

    const { projects } = await ctx.services.webConfig.fetchProjects();
    const project = survey?.projectId
      ? projects.find(({ id }: WebServerProjectRequest.ProjectResponse) => id === survey.projectId)
      : null;

    const { surveyQuestions, ...restOfSurvey } = survey;

    const formattedScreens = surveyQuestions
      .map((screen: any) => {
        return {
          ...screen,
          surveyScreenComponents: screen.surveyScreenComponents
            .map(formatComponent)
            .sort((a: any, b: any) => a.componentNumber - b.componentNumber),
        };
      })
      // Hide Task questions from the survey. They are not displayed in the web app and are
      // just used to trigger new tasks in the TaskCreationHandler
      .filter((question: Question) => question.type !== QuestionType.Task)
      .sort((a: any, b: any) => a.screenNumber - b.screenNumber);

    // renaming survey_questions to screens to make it make more representative of what it is, since questions is more representative of the component within the screen
    return {
      ...restOfSurvey,
      screens: formattedScreens,
      project,
    };
  }
}
