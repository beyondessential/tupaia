import { EntityTypeEnum } from '@tupaia/types';
import { snake } from 'case';
import { BESAdminCreateHandler } from '../CreateHandler';
import { uploadImage } from '../utilities';
/**
 * Handles POST endpoints:
 * - /projects
 */

const getCountryEntityId = async (models, countryId) => {
  const country = await models.country.findOne({
    id: countryId,
  });

  if (!country) throw new Error(`Country with id ${countryId} not found`);

  const entity = await models.entity.findOne({
    code: country.code,
    type: 'country',
  });

  if (!entity) throw new Error(`Entity with code ${country.code} not found`);

  return entity.id;
};

export class CreateProject extends BESAdminCreateHandler {
  async createRecord() {
    const {
      code: rawProjectCode,
      name,
      description,
      sort_order: sortOrder = null,
      permission_groups: permissionGroups,
      countries,
      entityTypes,
      default_measure: defaultMeasure,
      dashboard_group_name: dashboardGroupName,
      image_url: imageUrl,
      logo_url: logoUrl,
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

      const { name: projectDashboardGroupName } = await this.createProjectDashboard(
        transactingModels,
        dashboardGroupName,
        projectCode,
      );

      const projectPermissionGroup = await this.createProjectPermissionGroup(
        transactingModels,
        name,
      );

      // Add the project, and then upload the images afterward, so that if an error is caught when creating the record, the images aren't uploaded unnecessarily
      const newProject = await transactingModels.project.create({
        code: projectCode,
        description,
        sort_order: sortOrder === '' ? null : sortOrder,
        image_url: '',
        logo_url: '',
        permission_groups: [projectPermissionGroup.name, ...permissionGroups],
        default_measure: defaultMeasure,
        dashboard_group_name: projectDashboardGroupName,
        entity_id: projectEntityId,
        entity_hierarchy_id: projectEntityHierarchyId,
      });

      await this.insertImagePaths(transactingModels, newProject.id, projectCode, imageUrl, logoUrl);

      await this.createUserEntityPermissions(
        transactingModels,
        this.req.user.id,
        countries,
        projectPermissionGroup.id,
      );

      return newProject;
    });
  }

  async insertImagePaths(models, projectId, projectCode, encodedBackgroundImage, encodedLogoImage) {
    // image_url and logo_url are currently required fields, so the validator will error before this point if either of these is falsey.
    const updates = {
      image_url: await uploadImage(encodedBackgroundImage, projectCode, 'project_image', true),
      logo_url: await uploadImage(encodedLogoImage, projectCode, 'project_logo', true),
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
      type: EntityTypeEnum.project,
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
      const entityId = await getCountryEntityId(models, countryId);
      await models.entityRelation.create({
        parent_id: projectEntityId,
        child_id: entityId,
        entity_hierarchy_id: entityHierarchyId,
      });
    }
  }

  async createProjectDashboard(models, dashboardGroupName, projectCode) {
    return models.dashboard.create({
      code: `${projectCode}_project`,
      name: dashboardGroupName,
      root_entity_code: projectCode,
    });
  }

  async createEntityHierarchy(models, projectCode, entityTypes) {
    return models.entityHierarchy.create({
      name: projectCode,
      canonical_types: entityTypes ? `{${entityTypes.join(',')}}` : '{}',
    });
  }

  async createUserEntityPermissions(models, userId, countries, permissionGroupId) {
    for (const countryId of countries) {
      const entityId = await getCountryEntityId(models, countryId);
      await models.userEntityPermission.create({
        user_id: userId,
        entity_id: entityId,
        permission_group_id: permissionGroupId,
      });
    }
  }

  async createProjectPermissionGroup(models, name) {
    const BESDataAdminPermissionGroup = await models.permissionGroup.findOne({
      name: 'BES Data Admin',
    });
    return models.permissionGroup.create({
      name: `${name} Admin`,
      parent_id: BESDataAdminPermissionGroup.id,
    });
  }
}
