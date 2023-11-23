/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { sendEmail } from '@tupaia/server-utils';
import { PermissionsError } from '@tupaia/utils';
import {
  Dashboard,
  DashboardMailingList,
  DashboardMailingListEntry,
  Entity,
  Project,
  TupaiaWebEmailDashboardRequest,
} from '@tupaia/types';
import { downloadDashboardAsPdf } from '../utils';

export type EmailDashboardRequest = Request<
  TupaiaWebEmailDashboardRequest.Params,
  TupaiaWebEmailDashboardRequest.ResBody,
  TupaiaWebEmailDashboardRequest.ReqBody,
  TupaiaWebEmailDashboardRequest.ReqQuery
>;

export class EmailDashboardRoute extends Route<EmailDashboardRequest> {
  public async buildResponse() {
    const { projectCode, entityCode, dashboardCode } = this.req.params;
    const { baseUrl, selectedDashboardItems, cookieDomain } = this.req.body;
    const { cookie } = this.req.headers;

    if (!cookie) {
      throw new Error(`Must have a valid session to export a dashboard`);
    }

    const [project] = (await this.req.ctx.services.central.fetchResources('projects', {
      filter: {
        code: projectCode,
      },
      columns: ['id'],
    })) as Pick<Project, 'id'>[];
    const [projectEntity] = (await this.req.ctx.services.central.fetchResources('entities', {
      filter: {
        code: projectCode,
      },
      columns: ['name'],
    })) as Pick<Entity, 'name'>[];
    const [entity] = (await this.req.ctx.services.central.fetchResources('entities', {
      filter: {
        code: entityCode,
      },
      columns: ['id', 'name', 'country_code'],
    })) as Pick<Entity, 'id' | 'name' | 'country_code'>[];
    const [dashboard] = (await this.req.ctx.services.central.fetchResources('dashboards', {
      filter: { code: dashboardCode },
      columns: ['id', 'name'],
    })) as Pick<Dashboard, 'id' | 'name'>[];

    const entityPermissions = entity.country_code
      ? this.req.accessPolicy.getPermissionGroups([entity.country_code])
      : this.req.accessPolicy.getPermissionGroups(); // country_code is null for project level

    const [mailingList] = (await this.req.ctx.services.central.fetchResources(
      'dashboardMailingLists',
      {
        filter: {
          dashboard_id: dashboard.id,
          project_id: project.id,
          entity_id: entity.id,
        },
        columns: ['id', 'email_admin_permission_groups'],
      },
    )) as Pick<DashboardMailingList, 'id' | 'email_admin_permission_groups'>[];

    if (!mailingList) {
      throw new Error(
        `There is no mailing list for dashboard: ${dashboard.name} at: ${entity.name} in project: ${projectEntity.name}`,
      );
    }

    if (
      !mailingList.email_admin_permission_groups.some(permissionGroup =>
        entityPermissions.includes(permissionGroup),
      )
    ) {
      throw new PermissionsError(
        `User must belong to one of the mailing list's email admin permission groups in order to send the email export`,
      );
    }

    const mailingListEntries = (await this.req.ctx.services.central.fetchResources(
      'dashboardMailingListEntries',
      {
        filter: {
          dashboard_mailing_list_id: mailingList.id,
          subscribed: true,
        },
        columns: ['email'],
      },
    )) as Pick<DashboardMailingListEntry, 'email'>[];

    if (mailingListEntries.length === 0) {
      return { message: 'There are no users subscribed to this mailing list' };
    }

    const buffer = await downloadDashboardAsPdf(
      projectCode,
      entityCode,
      dashboard.name,
      baseUrl,
      cookie,
      cookieDomain,
      selectedDashboardItems,
    );

    const emails = mailingListEntries.map(({ email }) => email);
    const subject = `Tupaia Dashboard: ${projectEntity.name} ${entity.name} ${dashboard.name}`;
    const text = `Latest data for the ${dashboard.name} dashboard in ${entity.name}.`;
    const filename = `${projectEntity.name}-${entity.name}-${dashboard.name}-export.pdf`;

    sendEmail(emails, {
      subject,
      text,
      attachments: [{ filename, content: buffer }],
    });

    return { message: 'Export successfully sent!' };
  }
}
