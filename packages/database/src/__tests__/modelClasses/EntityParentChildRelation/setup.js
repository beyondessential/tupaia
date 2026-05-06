import { buildAndInsertProjectsAndHierarchies, clearTestData } from '../../../server/testUtilities';
import { entityHierarchyFixtures } from '../../../server/testFixtures';

const { PROJECTS, ENTITIES, ENTITY_RELATIONS } = entityHierarchyFixtures;

export const setupTestData = async models => {
  await clearTestData(models.database);

  const projectsForInserting = PROJECTS.map(project => {
    const relationsInProject = ENTITY_RELATIONS.filter(
      relation => relation.hierarchy === project.code,
    );
    const entityCodesInProject = relationsInProject.map(relation => relation.child);
    const entitiesInProject = entityCodesInProject.map(entityCode =>
      ENTITIES.find(entity => entity.code === entityCode),
    );
    return { ...project, entities: entitiesInProject, relations: relationsInProject };
  });

  // TUP-3065: parent_id is now set up directly by buildAndInsertProjectsAndHierarchies
  // (no closure-table warm-up step needed).
  await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
};
