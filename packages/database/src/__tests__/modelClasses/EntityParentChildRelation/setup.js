import { buildAndInsertProjectsAndHierarchies, clearTestData } from '../../../server/testUtilities';
import { EntityHierarchySubtreeRebuilder } from '../../../server/changeHandlers/entityHierarchyCacher/EntityHierarchySubtreeRebuilder';
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

  await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
  const projects = await Promise.all(
    projectsForInserting.map(project => models.project.findOne({ code: project.code })),
  );

  const hierarchyCacher = new EntityHierarchySubtreeRebuilder(models);
  for (const project of projects) {
    await hierarchyCacher.buildAndCacheProject(project);
  }
};
