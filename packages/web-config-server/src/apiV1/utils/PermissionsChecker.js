import { DashboardGroup, MapOverlay, DashboardReport } from '/models';
import { CustomError } from '@tupaia/utils';
// Permission fail messages, should unite responses in production mode
const permissionFail = {
  type: 'Permission Error',
  responseStatus: 401,
};
const noAccessToOrganisationUnit = {
  responseText: { status: 'Permission fail', details: 'No Access to Organisation unit' },
};
const organisationUnitDoesNotExist = {
  responseText: { status: 'Permission fail', details: 'Organisation unit does not exist' },
};
const dashboardDoesNotExist = {
  responseText: {
    status: 'Permission fail',
    details: 'Dashboard with this id and matching organisationUnit does not exist',
  },
};
const dashboardDoesNotMatchLevel = {
  responseText: {
    status: 'Permission fail',
    details: 'Dashboard with this id does not match organisation level',
  },
};
const dashboardUserGroupNotMatchOrgUnit = {
  responseText: {
    status: 'Permission fail',
    details: 'Dashboard with this is not allowed for given organisation unit',
  },
};
const measureDoesNotExist = {
  responseText: {
    status: 'Permission fail',
    details: 'Measure with this id does not exist',
  },
};
const measureUserGroupNotMatchOrgUnit = {
  responseText: {
    status: 'Permission fail',
    details: 'Measure with this id is not allowed for given organisation unit',
  },
};
const measuresDataNotAllowedForWorld = {
  responseText: {
    status: 'Permission fail',
    details: 'Measures data not allowed for world',
  },
};
const viewDoesNotMatchDashboard = {
  responseText: { status: 'Permission fail', details: 'View does not exist in dashboard' },
};
const measureIdNotPresent = {
  responseText: { status: 'Permission fail', details: 'measureId is not present in query' },
};
const endPointError = {
  responseText: { status: 'Permission fail', details: 'End point is not valid' },
};
const surveyDoesNotMatchView = {
  responseText: {
    status: 'Permission fail',
    details: 'surveyCodes do not match the given view',
  },
};
const organisationUnitSearchParamMismatch = {
  responseText: {
    status: 'Query params mismatch',
    details: 'criteria: text, limit: number',
  },
};
const routeNames = {
  organisationUnit: '/organisationUnit',
  view: '/view',
  survey: '/survey',
  dashboard: '/dashboard',
  measures: '/measures',
  measureData: '/measureData',
  organisationUnitSearch: '/organisationUnitSearch',
};

/* check for permission and either call onConfirm() or onConfirm({userInfo})
 * or send permissionFail message corresponding the error
 * checks
 *  - /organisationUnits -> check organisationUnit exists -> onConfirm
 *  - /dashboard -> check organisationUnit exists, check organisationUnit
 *       and ancestors again userConfig and deduce userLevel
 *       -> onConfirm({ userLevel, ancestors })
 *  - /view -> check as per dashboard and then check dashboardId exists and
 *       user has permission for it, then chec viewUId is in the dashboard
 *       -> onConfirm()
 */
export class PermissionsChecker {
  constructor(req, dhisApi, entity) {
    this.query = req.query;
    this.path = req.route.path;
    this.userHasAccess = req.userHasAccess;
    this.dhisApi = dhisApi;
    this.entity = entity;
  }

  async getPermissionsOrThrowError() {
    if (this.path === routeNames.organisationUnitSearch) {
      const { criteria, limit } = this.query;
      if (!criteria || !limit || criteria === '' || isNaN(parseInt(limit, 10))) {
        throw new CustomError(permissionFail, organisationUnitSearchParamMismatch);
      }
      return {};
    }

    if (!this.entity) {
      throw new CustomError(permissionFail, organisationUnitDoesNotExist);
    }

    if (this.entity.code !== 'World' && !(await this.userHasAccess(this.entity))) {
      throw new CustomError(permissionFail, noAccessToOrganisationUnit);
    }

    return this.checkForPermissions();
  }

  async checkForPermissions() {
    switch (this.path) {
      case routeNames.organisationUnit:
      case routeNames.dashboard:
      case routeNames.measures:
        return {};
      case routeNames.survey:
        await this.matchSurveyCodesToReport(); // Will throw an error if no match
        return this.checkViewPermissions();
      case routeNames.view:
        return this.checkViewPermissions();
      case routeNames.measureData:
        return this.checkMeasureDataPermissions();
      default:
        // this will never be reached, but incase we have more routes
        throw new CustomError(permissionFail, endPointError);
    }
  }

  // Get dashboardGroup based on id from db, and check it matches user permissions
  async checkViewPermissions() {
    const { dashboardGroupId } = this.query;
    const dashboardGroup = await DashboardGroup.findById(dashboardGroupId);
    if (!dashboardGroup) {
      throw new CustomError(permissionFail, dashboardDoesNotExist);
    } else if (dashboardGroup.organisationLevel !== this.entity.getOrganisationLevel()) {
      // eslint-disable-line max-len
      throw new CustomError(permissionFail, dashboardDoesNotMatchLevel);
    } else {
      await this.matchUserGroupToOrganisationUnit(
        dashboardGroup.userGroup,
        dashboardUserGroupNotMatchOrgUnit,
      );
      return this.matchReportToDashboard(dashboardGroup.dashboardReports);
    }
  }

  // Get measure by id from db, check it matches user permissions
  async checkMeasureDataPermissions() {
    const { measureId } = this.query;
    if (this.entity.getOrganisationLevel() === 'World') {
      throw new CustomError(permissionFail, measuresDataNotAllowedForWorld);
    }

    if (!measureId) {
      throw new CustomError(permissionFail, measureIdNotPresent);
    }

    const overlayQueries = measureId.split(',').map(async id => {
      const overlay = await MapOverlay.findById(id);

      if (!overlay) {
        throw new CustomError(permissionFail, measureDoesNotExist);
      }

      await this.matchUserGroupToOrganisationUnit(
        overlay.userGroup,
        measureUserGroupNotMatchOrgUnit,
      );

      return overlay;
    });

    const overlays = await Promise.all(overlayQueries);
    return { overlays };
  }

  // Will check to see if userGroup exists in user permissions, will then see if
  // current organisaiton unit or ancestors are within user configs for the given
  // user group.  will respond with corresponing error messages or call onSuccess
  async matchUserGroupToOrganisationUnit(userGroup, organisationUnitUserGroupNotMatchMessage) {
    const { code } = this.entity;
    const doesUserHaveAccess = await this.userHasAccess(code, userGroup);

    // All users always have access to 'World' dashboard reports.
    if (code !== 'World' && !doesUserHaveAccess) {
      throw new CustomError(permissionFail, organisationUnitUserGroupNotMatchMessage);
    }
  }

  // For each report in dashboardReports, find our reportId
  matchReportToDashboard(dashboardReports) {
    const { viewId } = this.query;
    const isViewInDashboard = dashboardReports.some(thisReportId => viewId === thisReportId);
    if (!isViewInDashboard) {
      throw new CustomError(permissionFail, viewDoesNotMatchDashboard);
    }
    return {};
  }

  async matchSurveyCodesToReport() {
    const { reportId, surveyCodes } = this.query;
    const { viewJson } = await DashboardReport.findById(reportId);
    const isSingleSurvey = viewJson.surveyCode;
    const doSurveyCodesMatchDashboardReport = isSingleSurvey
      ? viewJson.surveyCode === surveyCodes[0]
      : surveyCodes.every(surveyCode => viewJson.surveys.some(({ code }) => code === surveyCode));
    if (!doSurveyCodesMatchDashboardReport) {
      throw new CustomError(permissionFail, surveyDoesNotMatchView);
    }
  }
}
