import { DataBrokerModelRegistry, Event } from '../../types';
import { KoboSubmission, QuestionMapping } from './types';

export class KoBoTranslator {
  private readonly models: DataBrokerModelRegistry;

  public constructor(models: DataBrokerModelRegistry) {
    this.models = models;
  }

  private async fetchEntityInfoFromKoBoAnswer(koboEntityCode: string) {
    const entityMapping = await this.models.dataServiceEntity.findOne({
      'config->>kobo_id': koboEntityCode,
    });
    if (!entityMapping) {
      return { orgUnit: koboEntityCode, orgUnitName: koboEntityCode };
    }
    const entity = await this.models.entity.findOne({ code: entityMapping.entity_code });
    if (!entity) {
      return { orgUnit: koboEntityCode, orgUnitName: koboEntityCode };
    }
    return { orgUnit: entity.code, orgUnitName: entity.name };
  }

  private async translateSingleKoBoResult(
    result: KoboSubmission,
    questionMapping: QuestionMapping,
    entityQuestion: string,
  ): Promise<Event & { assessor: string }> {
    const {
      _id: event,
      _submission_time: eventDate,
      _submitted_by: assessor,
      [entityQuestion]: koboEntityCode,
      ...restOfFields
    } = result;

    if (!koboEntityCode) {
      throw new Error(
        `Cannot find a question in the Kobo survey response matching the entityQuestionCode: ${entityQuestion}`,
      );
    }

    const { orgUnit, orgUnitName } = await this.fetchEntityInfoFromKoBoAnswer(koboEntityCode);
    // Map kobo questions to tupaia question codes
    const dataValues: Event['dataValues'] = {};
    for (const [tupaiaQuestionCode, { koboQuestionCode, answerMap }] of Object.entries(
      questionMapping,
    )) {
      if (restOfFields[koboQuestionCode] !== undefined) {
        const koboValue = restOfFields[koboQuestionCode];
        dataValues[tupaiaQuestionCode] =
          answerMap?.[koboValue] !== undefined ? answerMap[koboValue] : koboValue;
      }
    }

    return {
      event,
      eventDate,
      assessor,
      orgUnit,
      orgUnitName,
      dataValues,
    };
  }

  public async translateKoBoResults(
    results: KoboSubmission[],
    questionMapping: QuestionMapping,
    entityQuestion: string,
  ) {
    return Promise.all(
      results.map(result =>
        this.translateSingleKoBoResult(result, questionMapping, entityQuestion),
      ),
    );
  }
}
