/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionsError } from '@tupaia/utils';
import { Route } from '../Route';
import { PSSS_PERMISSION_GROUP } from '../../constants';

export class ConfirmedCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek } = this.req.query;
    const countryCode = await this.getCountryCode();
    const reportData = await this.reportConnection?.fetchReport(
      'PSSS_Confirmed_Weekly_Report',
      [countryCode],
      [startWeek], //Only need to send startWeek period because this is a weekly report
    );

    return {
      startWeek,
      endWeek,
      country: countryCode,
      data: reportData,
    };
  }

  async getCountryCode() {
    const { organisationUnitCode } = this.req.params;
    const { accessPolicy } = await this.getSession();
    const entity = await this.models.entity.findOne({ code: organisationUnitCode });
    if (!entity || !accessPolicy.allows(entity.country_code, PSSS_PERMISSION_GROUP)) {
      throw new PermissionsError('User does not have PSSS permission for the requested country');
    }

    return entity.country_code;
  }
}
