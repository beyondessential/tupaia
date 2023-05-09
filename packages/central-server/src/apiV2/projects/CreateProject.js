/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import AWS from 'aws-sdk';
import { snake } from 'case';
import { S3Client } from '@tupaia/utils';
import { BESAdminCreateHandler } from '../CreateHandler';
import { getStandardisedImageName } from '../../utilities';
/**
 * Handles POST endpoints:
 * - /projects
 */

export class CreateProject extends BESAdminCreateHandler {
  async uploadImage(encodedImage, projectCode, type) {
    const s3Client = new S3Client(new AWS.S3());
    // Upload the image with a standardised file name and upload to s3.
    const imagePath = await s3Client.uploadImage(
      encodedImage,
      getStandardisedImageName(projectCode, type),
      true,
    );
    return imagePath;
  }

  async createRecord() {
    const {
      code: rawProjectCode,
      name,
      description,
      sort_order,
      permission_groups,
      countries,
      entityTypes,
      default_measure,
      dashboard_group_name,
      image_url,
      logo_url,
    } = this.newRecordData;

    const projectCode = snake(rawProjectCode);
    await this.models.wrapInTransaction(async transactingModels => {
      const { id: projectEntityId } = await this.createProjectEntity(
        transactingModels,
        projectCode,
        name,
      );

      const { id: projectEntityHierarchyId } = await this.createEntityHierarchy(
        transactingModels,
        projectCode,
        entityTypes,
      );

      await this.createProjectEntityRelations(transactingModels, projectCode, countries);
      const { name: dashboardGroupName } = await this.createProjectDashboard(
        transactingModels,
        dashboard_group_name,
        projectCode,
      );
      // Add the project, and then upload the images afterward, so that if an error is caught when creating the record, the images aren't uploaded unnecessarily
      const newProject = await transactingModels.project.create({
        code: projectCode,
        description,
        sort_order,
        image_url: '',
        logo_url: '',
        permission_groups,
        default_measure,
        dashboard_group_name: dashboardGroupName,
        entity_id: projectEntityId,
        entity_hierarchy_id: projectEntityHierarchyId,
      });
      await this.insertImagePaths(
        transactingModels,
        newProject.id,
        projectCode,
        image_url,
        logo_url,
      );

      return newProject;
    });
  }

  async insertImagePaths(models, projectId, projectCode, image_url, logo_url) {
    // image_url and logo_url are currently required fields, so the validator will error before this point if either of these is falsey.
    const updates = {
      image_url: await this.uploadImage(image_url, projectCode, 'project_image'),
      logo_url: await this.uploadImage(logo_url, projectCode, 'project_logo'),
    };
    // The record has already been updated, so update the existing record with the new fields
    return models.project.updateById(projectId, updates);
  }

  async createProjectEntity(models, projectCode, name) {
    const worldCode = 'World';
    const { id: worldId } = await models.entity.findOne({ code: worldCode });

    return models.entity.create({
      name,
      code: projectCode,
      parent_id: worldId,
      type: 'project',
    });
  }

  async createProjectEntityRelations(models, projectCode, countries) {
    const { id: projectEntityId } = await models.entity.findOne({
      code: projectCode,
    });
    const { id: entityHierarchyId } = await models.entityHierarchy.findOne({
      name: projectCode,
    });

    for (const countryId of countries) {
      const { code: countryCode } = await models.country.findOne({
        id: countryId,
      });
      const { id: entityId } = await models.entity.findOne({
        code: countryCode,
        type: 'country',
      });
      await models.entityRelation.create({
        parent_id: projectEntityId,
        child_id: entityId,
        entity_hierarchy_id: entityHierarchyId,
      });
    }
  }

  async createProjectDashboard(models, dashboard_group_name, projectCode) {
    return models.dashboard.create({
      code: `${projectCode}_project`,
      name: dashboard_group_name,
      root_entity_code: projectCode,
    });
  }

  async createEntityHierarchy(models, projectCode, entityTypes) {
    return models.entityHierarchy.create({
      name: projectCode,
      canonical_types: entityTypes ? `{${entityTypes.join(',')}}` : '{}',
    });
  }
}
