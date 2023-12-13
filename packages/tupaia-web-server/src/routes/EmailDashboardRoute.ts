/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { sendEmail } from '@tupaia/server-utils';
import {
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
    const { projectCode, entityCode, dashboardName } = this.req.params;
    const { dashboardId, baseUrl, selectedDashboardItems, cookieDomain } = this.req.body;
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
      columns: ['id', 'name'],
    })) as Pick<Entity, 'id' | 'name'>[];

    // TODO: Add check to ensure user has permissions to send the email (RN-1073)

    const [mailingList] = (await this.req.ctx.services.central.fetchResources(
      'dashboardMailingLists',
      {
        filter: {
          dashboard_id: dashboardId,
          project_id: project.id,
          entity_id: entity.id,
        },
        columns: ['id'],
      },
    )) as Pick<DashboardMailingList, 'id'>[];

    if (!mailingList) {
      return {
        message: `There is no mailing list for dashboard: ${dashboardName} at: ${entity.name} in project: ${projectEntity.name}`,
      };
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
      return { message: 'There are no users subscribed to this dashboard mailing list' };
    }

    const buffer = await downloadDashboardAsPdf(
      projectCode,
      entityCode,
      dashboardName,
      baseUrl,
      cookie,
      cookieDomain,
      selectedDashboardItems,
    );

    const emails = mailingListEntries.map(({ email }) => email);
    const subject = `Tupaia Dashboard: ${projectEntity.name} ${entity.name} ${dashboardName}`;
    const text = `Latest data for the ${dashboardName} dashboard in ${entity.name}.`;
    const filename = `${projectEntity.name}-${entity.name}-${dashboardName}-export.pdf`;

    sendEmail(emails, {
      subject,
      text,
      attachments: [{ filename, content: buffer }],
    });

    return { message: 'Sent dashboard export to the mailing list' };
  }
}
