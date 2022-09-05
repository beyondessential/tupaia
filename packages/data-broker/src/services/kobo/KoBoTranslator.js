/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export class KoBoTranslator {
  constructor(models) {
    this.models = models;
  }

  async fetchEntityInfoFromKoBoAnswer(koboEntityCode) {
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

  async translateSingleKoBoResult(result, questionMapping, entityQuestion) {
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
    const dataValues = {};
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

  async translateKoBoResults(results, questionMapping, entityQuestion) {
    return Promise.all(
      results.map(result =>
        this.translateSingleKoBoResult(result, questionMapping, entityQuestion),
      ),
    );
  }
}
