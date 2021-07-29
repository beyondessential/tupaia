/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

export class KoBoTranslator {
  constructor(models) {
    this.models = models;
  }

  async fetchEntityInfoFromKoBoAnswer(koboEntityCode) {
    const entity = await this.models.entity.findOne({ code: `LA_sch_${koboEntityCode}` });
    return { orgUnit: entity.code, orgUnitName: entity.name };
  }

  async translateSingleKoBoResult(result, questionCodeMapping, entityQuestion) {
    const {
      _id: event,
      _submission_time: eventDate,
      [entityQuestion]: koboEntityCode,
      ...restOfFields
    } = result;

    const { orgUnit, orgUnitName } = await this.fetchEntityInfoFromKoBoAnswer(koboEntityCode);
    // Map kobo questions to tupaia question codes
    const dataValues = {};
    for (const [tupaia, kobo] of Object.entries(questionCodeMapping)) {
      if (restOfFields[kobo]) {
        dataValues[tupaia] = restOfFields[kobo];
      }
    }

    return {
      event,
      eventDate,
      orgUnit,
      orgUnitName,
      dataValues,
    };
  }

  async translateKoBoResults(results, questionCodeMapping, entityQuestion) {
    // TODO: Should maybe swap this to fetch all at once
    return Promise.all(
      results.map(result =>
        this.translateSingleKoBoResult(result, questionCodeMapping, entityQuestion),
      ),
    );
  }
}
