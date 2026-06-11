import { EntityTypeEnum } from '@tupaia/types';
import { BESAdminCreateHandler } from './CreateHandler';

/**
 * Handles POST /countries.
 *
 * Creating a country is no longer just a `country` table row: a country needs a
 * matching shared entity (type `country`, parented to World, `project_id` NULL)
 * for the hierarchy, and — when created from within a project scope — a
 * `project_country` row so the new country belongs to the active project. This
 * keeps the three in step so a freshly added country is immediately usable for
 * entity import/export and visualisation within that project.
 */
export class CreateCountry extends BESAdminCreateHandler {
  async createRecord() {
    const { code, name } = this.newRecordData;
    const { projectCode } = this.req.query;

    await this.models.wrapInTransaction(async transactingModels => {
      await transactingModels.country.create({ code, name });

      const world = await transactingModels.entity.findOne({
        type: transactingModels.entity.types.WORLD,
      });
      const countryEntity = await transactingModels.entity.findOrCreate(
        { code, project_id: null },
        {
          name,
          country_code: code,
          type: EntityTypeEnum.country,
          parent_id: world.id,
          // All countries sync from the regional DHIS2 instance — mirror the
          // default the entity importer assigns to country entities.
          metadata: { dhis: { dhisInstanceCode: 'regional' } },
        },
      );

      if (projectCode) {
        const project = await transactingModels.project.findOne({ code: projectCode });
        if (project) {
          await transactingModels.projectCountry.findOrCreate(
            { project_id: project.id, country_id: countryEntity.id },
            { project_id: project.id, country_id: countryEntity.id },
          );
        }
      }
    });
  }
}
