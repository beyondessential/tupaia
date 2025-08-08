import { generateId } from '@tupaia/database';
import { convertPeriodStringToDateRange, stripTimezoneFromDate } from '@tupaia/utils';
import { Entity, Survey } from '@tupaia/types';
import { TupaiaApiClient } from '@tupaia/api-client';

type SurveyResponseObject = {
  'entity.code': string;
  'survey.code': string;
  data_time: string;
  id: string;
};

type Answer = {
  code: string;
  value: string | number;
};

/**
 * Wrapper around CentralApi
 */
export class CentralConnection {
  private readonly centralApi: TupaiaApiClient['central'];
  private readonly userEmail: string;

  public constructor(centralApi: TupaiaApiClient['central'], userEmail: string) {
    this.centralApi = centralApi;
    this.userEmail = userEmail;
  }

  public async updateOrCreateSurveyResponse(
    surveyCode: string,
    orgUnitCode: string,
    period: string,
    answers: Answer[],
  ) {
    const existingSurveyResponse = await this.findSurveyResponse(surveyCode, orgUnitCode, period);

    if (existingSurveyResponse) {
      return this.updateSurveyResponseByObject(existingSurveyResponse, answers);
    }

    return this.createSurveyResponse(surveyCode, orgUnitCode, period, answers);
  }

  private async findSurveyResponses(
    surveyCode: string,
    orgUnitCode: string,
    period: string,
    pageSize?: string | undefined,
  ) {
    const [startDate, endDate] = convertPeriodStringToDateRange(period);
    return this.centralApi.fetchResources(`surveyResponses`, {
      page: '0',
      pageSize,
      columns: ['entity.code', 'survey.code', 'data_time', 'id'],
      filter: {
        'survey.code': { comparisonValue: surveyCode },
        'entity.code': { comparisonValue: orgUnitCode },
        data_time: {
          comparator: 'BETWEEN',
          comparisonValue: [startDate, endDate],
          castAs: 'date',
        },
      },
      sort: ['data_time DESC'],
    }) as Promise<SurveyResponseObject[]>;
  }

  public async findSurveyResponse(surveyCode: string, orgUnitCode: string, period: string) {
    const results = await this.findSurveyResponses(surveyCode, orgUnitCode, period, '1');
    return results.length > 0 ? results[0] : undefined;
  }

  public async findSurveyResponseById(surveyResponseId: string) {
    return this.centralApi.fetchResources(`surveyResponses/${surveyResponseId}`, {
      columns: ['entity.code', 'survey.code', 'data_time', 'id'],
    });
  }

  private async findSurvey(surveyCode: string): Promise<Pick<Survey, 'code' | 'id'> | undefined> {
    const surveys = await this.centralApi.fetchResources(`surveys`, {
      filter: {
        code: { comparisonValue: surveyCode },
      },
      columns: ['code', 'id'],
    });
    return surveys.length > 0 ? surveys[0] : undefined;
  }

  private async findEntity(entityCode: string): Promise<Pick<Entity, 'code' | 'id'> | undefined> {
    const entities = await this.centralApi.fetchResources(`entities`, {
      filter: {
        code: { comparisonValue: entityCode },
      },
      columns: ['code', 'id'],
    });
    return entities.length > 0 ? entities[0] : undefined;
  }

  public async updateSurveyResponse(
    id: string,
    entityCode: string,
    surveyCode: string,
    period: string,
    answers: Answer[],
  ) {
    const [, endDate] = convertPeriodStringToDateRange(period);
    const surveyResponse = {
      id,
      'entity.code': entityCode,
      'survey.code': surveyCode,
      data_time: stripTimezoneFromDate(new Date(endDate).toISOString()),
    };

    return this.updateSurveyResponseByObject(surveyResponse, answers);
  }

  public async updateSurveyResponseByObject(
    surveyResponse: SurveyResponseObject,
    answers: Answer[],
  ) {
    const newAnswers = Object.fromEntries(answers.map(({ code, value }) => [code, value]));
    const currentDate = new Date().toISOString();

    return this.centralApi.createResource(
      `surveyResponse/${surveyResponse.id}/resubmit`,
      {
        waitForAnalyticsRebuild: 'true',
      },
      {
        start_time: currentDate,
        end_time: currentDate,
        answers: newAnswers,
      },
    );
  }

  public async createSurveyResponse(
    surveyCode: string,
    organisationUnitCode: string,
    period: string,
    answers: Answer[],
  ) {
    const [, endDate] = convertPeriodStringToDateRange(period);

    const newAnswers = Object.fromEntries(answers.map(({ code, value }) => [code, value]));

    const survey = await this.findSurvey(surveyCode);
    const entity = await this.findEntity(organisationUnitCode);

    const date = new Date().toISOString();
    const surveyResponseId = generateId();
    const response = await this.centralApi.createResource(
      `surveyResponse`,
      {
        waitForAnalyticsRebuild: 'true',
      },
      [
        {
          id: surveyResponseId,
          data_time: stripTimezoneFromDate(new Date(endDate).toISOString()),
          survey_id: survey?.id,
          entity_code: organisationUnitCode,
          entity_id: entity?.id,
          user_email: this.userEmail,
          start_time: date,
          end_time: date,
          timestamp: date,
          answers: newAnswers,
        },
      ],
    );

    return { surveyResponseId, ...response };
  }

  public async deleteSurveyResponse(surveyResponseId: string) {
    return this.centralApi.deleteResource(`surveyResponses/${surveyResponseId}`, {
      waitForAnalyticsRebuild: 'true',
    });
  }
}
