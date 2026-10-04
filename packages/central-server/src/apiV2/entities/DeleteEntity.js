import { BESAdminDeleteHandler } from '../DeleteHandler';

const UNDELETEABLE_ENTITY_TYPES = ['project', 'country'];

export class DeleteEntity extends BESAdminDeleteHandler {
  async deleteRecord() {
    const entity = await this.resourceModel.findById(this.recordId);
    if (UNDELETEABLE_ENTITY_TYPES.includes(entity.type)) {
      throw new Error(`Cannot delete an entity of type: ${entity.type}`);
    }

    // Check for existing survey responses (they should be cleaned up first)
    const surveyResponsesForEntity = await this.models.surveyResponse.find({
      entity_id: entity.id,
    });
    if (surveyResponsesForEntity.length > 0) {
      throw new Error(
        `There are still survey responses for this entity, please clean them up before deleting this entity`,
      );
    }

    // Check for children (they should be given a new parent first). A sub-country
    // entity belongs to exactly one project (entity.project_id); structural entities
    // can show up across projects, so walk every project containing this entity.
    const projects = entity.project_id
      ? [await this.models.project.findById(entity.project_id)].filter(Boolean)
      : await this.models.project.all();
    const projectsWhereEntityHasChildren = [];
    for (const project of projects) {
      const children = await entity.getChildren(project.id);
      if (children.length > 0) {
        projectsWhereEntityHasChildren.push(project);
      }
    }

    if (projectsWhereEntityHasChildren.length > 0) {
      throw new Error(
        `This entity still has children in the following projects [${projectsWhereEntityHasChildren.map(
          project => project.code,
        )}], please delete them or re-import them with a new parent before deleting this entity`,
      );
    }

    await super.deleteRecord();
  }
}
