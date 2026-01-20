import { generateId } from '../../../core/utilities';
import { RECORDS } from '../../../core/records';
import { ChangeHandler } from '../ChangeHandler';
import { EntityHierarchySubtreeRebuilder } from './EntityHierarchySubtreeRebuilder';

export class EntityHierarchyCacher extends ChangeHandler {
  constructor(models) {
    super(models, 'entity-hierarchy-cacher');

    this.changeTranslators = {
      entity: change => this.translateEntityChangeToRebuildJobs(change),
      entityRelation: change => this.translateEntityRelationChangeToRebuildJobs(change),
      entityHierarchy: change => this.translateEntityHierarchyChangeToRebuildJobs(change),
    };
  }

  async translateEntityChangeToRebuildJobs({ record_id: entityId, new_record: newRecord }) {
    // if entity was deleted or created, or parent_id has changed, we need to delete subtrees and
    // rebuild all hierarchies
    const hierarchies = await this.models.entityHierarchy.all();
    const jobs = hierarchies.map(({ id: hierarchyId }) => ({
      hierarchyId,
      rootEntityId: newRecord.parent_id,
    }));
    return jobs;
  }

  translateEntityRelationChangeToRebuildJobs({ old_record: oldRecord, new_record: newRecord }) {
    // delete and rebuild subtree from both old and new record, in case hierarchy and/or parent_id
    // have changed
    const jobs = [oldRecord, newRecord].filter(Boolean).map(r => ({
      hierarchyId: r.entity_hierarchy_id,
      rootEntityId: r.parent_id,
    }));
    return jobs;
  }

  async translateEntityHierarchyChangeToRebuildJobs({
    record_id: hierarchyId,
    old_record: oldRecord,
    new_record: newRecord,
  }) {
    if (oldRecord && newRecord) {
      if (oldRecord.canonical_types === newRecord.canonical_types) {
        return null; // if the canonical types are the same, the change won't invalidate the cache
      }
    }
    const projectsUsingHierarchy = await this.models.project.find({
      entity_hierarchy_id: hierarchyId,
    });
    // delete and rebuild full hierarchy of any project using this entity
    const jobs = projectsUsingHierarchy.map(p => ({
      hierarchyId,
      rootEntityId: p.entity_id,
    }));
    return jobs;
  }

  async handleChanges(transactingModels, rebuildJobs) {
    // get the subtrees to delete, then run the delete
    const subtreeRebuilder = new EntityHierarchySubtreeRebuilder(transactingModels);
    await subtreeRebuilder.rebuildSubtrees(rebuildJobs);

    // explicitly flag ancestor_descendant_relation as changed so that model level caches are cleared
    // TODO: Remove this as part of RN-704
    await transactingModels.database.markRecordsAsChanged(
      RECORDS.ANCESTOR_DESCENDANT_RELATION,
      rebuildJobs.map(({ hierarchyId, rootEntityId }) => ({
        id: generateId(),
        hierarchyId,
        rootEntityId,
      })),
    );
  }
}
