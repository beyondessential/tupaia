import { EntityTypeEnum } from '@tupaia/types';
import { BESAdminCreateHandler } from './CreateHandler';

/**
 * Handles POST /countries.
 *
 * Creating a country is no longer just a `country` table row: a country also
 * needs a matching shared entity (type `country`, parented to World,
 * `project_id` NULL) for the hierarchy. The Countries tab is an all-projects
 * view, so the country isn't tied to any project here — associating it with a
 * project is a separate step (project_country).
 */
export class CreateCountry extends BESAdminCreateHandler {
  async createRecord() {
    const { code, name } = this.newRecordData;

    await this.models.wrapInTransaction(async transactingModels => {
      await transactingModels.country.create({ code, name });

      const world = await transactingModels.entity.findOne({
        type: transactingModels.entity.types.WORLD,
      });
      if (!world) {
        throw new Error(
          'World entity not found — run entity hierarchy setup before creating countries',
        );
      }
      await transactingModels.entity.findOrCreate(
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
    });
  }
}
