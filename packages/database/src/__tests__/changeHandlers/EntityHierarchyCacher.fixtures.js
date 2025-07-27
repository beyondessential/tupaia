// canonical hierarchy splits into two children at each of two generations
//          a
//    aa         ab
// aaa  aab   aba  abb
// there are an additional two children below aaa that are not of a canonical type, so aren't included
// in the default canonical hierarchy, but are included in hierarchy wind
const ENTITIES = [
  { id: 'entity_a_test', name: 'Entity A', parent_id: null, type: 'project' },
  { id: 'entity_aa_test', name: 'Entity AA', parent_id: 'entity_a_test', type: 'country' },
  { id: 'entity_ab_test', name: 'Entity AB', parent_id: 'entity_a_test', type: 'country' },
  { id: 'entity_ac_test', name: 'Entity AC', parent_id: 'entity_a_test', type: 'case' },
  { id: 'entity_ad_test', name: 'Entity AD', parent_id: 'entity_a_test', type: 'case' },
  { id: 'entity_aaa_test', name: 'Entity AAA', parent_id: 'entity_aa_test', type: 'district' },
  { id: 'entity_aab_test', name: 'Entity AAB', parent_id: 'entity_aa_test', type: 'sub_district' },
  { id: 'entity_aba_test', name: 'Entity ABA', parent_id: 'entity_ab_test', type: 'facility' },
  { id: 'entity_abb_test', name: 'Entity ABB', parent_id: 'entity_ab_test', type: 'facility' },
];

// two hierarchies to play with
const ENTITY_HIERARCHIES = [
  { id: 'hierarchy_ocean_test' },
  { id: 'hierarchy_storm_test' },
  {
    id: 'hierarchy_wind_test',
    canonical_types: ['project', 'country', 'district', 'sub_district', 'case'],
  },
];

// a project for each of the two hierarchies
const PROJECTS = [
  {
    code: 'project_ocean_test',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_ocean_test',
  },
  {
    code: 'project_storm_test',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_storm_test',
  },
  {
    code: 'project_wind_test',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_wind_test',
  },
];

// - project ocean follows the canonical hierarchy exactly
// - project storm moves the ab subtree to live below aa, to replace aaa and aab, and then aaa below
//   aba, and aab below abb
//      a
//      aa
//      ab
//   aba  abb
//   aaa  aab
const ENTITY_RELATIONS = [
  {
    parent_id: 'entity_a_test',
    child_id: 'entity_aa_test',
    entity_hierarchy_id: 'hierarchy_storm_test',
  },
  {
    parent_id: 'entity_aa_test',
    child_id: 'entity_ab_test',
    entity_hierarchy_id: 'hierarchy_storm_test',
  },
  {
    parent_id: 'entity_aba_test',
    child_id: 'entity_aaa_test',
    entity_hierarchy_id: 'hierarchy_storm_test',
  },
  {
    parent_id: 'entity_abb_test',
    child_id: 'entity_aab_test',
    entity_hierarchy_id: 'hierarchy_storm_test',
  },
];

export const TEST_DATA = {
  entity: ENTITIES,
  entityHierarchy: ENTITY_HIERARCHIES,
  project: PROJECTS,
  entityRelation: ENTITY_RELATIONS,
};

// For ease of reading, we store the expected relations in the format
// [ancestor_id, descendant_id, generational_distance]
// These utils will convert them to more full ancestor_descendant_relation records
// e.g.
// [['a', 'aa', 1], ['a', 'aaa', 2]]
// ->
// [
//   {
//     ancestor_id: 'entity_a_test',
//     descendant_id: 'entity_aa_test',
//     generational_distance: 1,
//   },
//   {
//     ancestor_id: 'entity_a_test',
//     descendant_id: 'entity_aaa_test',
//     generational_distance: 2,
//   },
// ];
const entityLettersToId = letters => `entity_${letters}_test`;
const expandEntityRelations = relations =>
  relations.map(r => ({
    ancestor_id: entityLettersToId(r[0]),
    descendant_id: entityLettersToId(r[1]),
    generational_distance: r[2],
  }));

// Hierarchy ocean is completely canonical, with the default canonical types
//          a
//    aa         ab
// aaa  aab   aba  abb
export const INITIAL_HIERARCHY_OCEAN = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 1],
  ['a', 'aaa', 2],
  ['a', 'aab', 2],
  ['a', 'aba', 2],
  ['a', 'abb', 2],
  // ancestor entity aa
  ['aa', 'aaa', 1],
  ['aa', 'aab', 1],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
]);

// Hierarchy storm has entity relations providing an alternative hierarchy
//      a
//      aa
//      ab
//   aba  abb
//   aaa  aab
export const INITIAL_HIERARCHY_STORM = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'abb', 3],
  ['a', 'aaa', 4],
  ['a', 'aab', 4],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'abb', 2],
  ['aa', 'aaa', 3],
  ['aa', 'aab', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'aaa', 2],
  ['ab', 'aab', 2],
  // ancestor entity aba
  ['aba', 'aaa', 1],
  // ancestor entity abb
  ['abb', 'aab', 1],
]);

// Hierarchy wind has a different set of canonical types, which excludes facility and includes
// case, so ac and ad (cases) are included, but aba and abb (facilities) are not
//                a
//    aa      ab      ac      ad
// aaa  aab
export const INITIAL_HIERARCHY_WIND = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 1],
  ['a', 'ac', 1],
  ['a', 'ad', 1],
  ['a', 'aaa', 2],
  ['a', 'aab', 2],
  // ancestor entity aa
  ['aa', 'aaa', 1],
  ['aa', 'aab', 1],
]);

// when aaa is deleted, it just gets taken off the end
//      a
//      aa
//      ab
//   aba  abb
//        aab
export const HIERARCHY_STORM_AFTER_ENTITY_AAA_DELETED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'abb', 3],
  ['a', 'aab', 4],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'abb', 2],
  ['aa', 'aab', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'aab', 2],
  // ancestor entity abb
  ['abb', 'aab', 1],
]);

// when ab, aba, aaa, and abb are deleted, it just leaves
// a
// aa
// aab
export const HIERARCHY_STORM_AFTER_MULTIPLE_ENTITIES_DELETED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'aab', 2],
  // ancestor entity aa
  ['aa', 'aab', 1],
]);

// after deleting aba -> aaa, it leaves the rest of the structure intact, and just the aaa leaf
// node has been dropped
//      a
//      aa
//      ab
//   aba  abb
//        aab
export const HIERARCHY_STORM_AFTER_RELATION_ABA_AAA_DELETED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'abb', 3],
  ['a', 'aab', 4],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'abb', 2],
  ['aa', 'aab', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'aab', 2],
  // ancestor entity abb
  ['abb', 'aab', 1],
]);

// after deleting aa -> ab, it means the canonical structure takes back over below aa, and the ab
// subtree gets left out of the hierarchy altogether
//     a
//    aa
// aaa  aab
export const HIERARCHY_STORM_AFTER_MULTIPLE_RELATIONS_DELETED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'aaa', 2],
  ['a', 'aab', 2],
  // ancestor entity aa
  ['aa', 'aaa', 1],
  ['aa', 'aab', 1],
]);

// Hierarchy ocean is completely canonical, with the default canonical types
//          a
//    aa         ab
// aaa  aab   aba  abb
// within the canonical hierarchy, the parent_id changes move aaa up to directly below a, and abb
// across to live underneath aaa
//       a
//  aa  ab   aaa
// aab  aba  abb
export const HIERARCHY_OCEAN_AFTER_PARENT_ID_CHANGES = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 1],
  ['a', 'aaa', 1],
  ['a', 'aab', 2],
  ['a', 'aba', 2],
  ['a', 'abb', 2],
  // ancestor entity aa
  ['aa', 'aab', 1],
  // ancestor entity ab
  ['ab', 'aba', 1],
  // ancestor entity aaa
  ['aaa', 'abb', 1],
]);

// changing the parent_id of abb to aaa causes the abb -> aab tree to move below aaa, resulting in
// one long path through the entities
// a
// aa
// ab
// aba
// aaa
// abb
// aab
// the update of the canonical parent_id of aaa has no impact, as the alternative hierarchy is used
// at that generation
export const HIERARCHY_STORM_AFTER_PARENT_ID_CHANGES = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'aaa', 4],
  ['a', 'abb', 5],
  ['a', 'aab', 6],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'aaa', 3],
  ['aa', 'abb', 4],
  ['aa', 'aab', 5],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'aaa', 2],
  ['ab', 'abb', 3],
  ['ab', 'aab', 4],
  // ancestor entity aba
  ['aba', 'aaa', 1],
  ['aba', 'abb', 2],
  ['aba', 'aab', 3],
  // ancestor entity aaa
  ['aaa', 'abb', 1],
  ['aaa', 'aab', 2],
  // ancestor entity abb
  ['abb', 'aab', 1],
]);

// test moves the aba -> aaa entity relation over to hierarchy ocean, dropping aaa from hierarchy
// storm
//      a
//      aa
//      ab
//   aba  abb
//        aab
export const HIERARCHY_STORM_AFTER_RELATION_HIERARCHY_CHANGED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'abb', 3],
  ['a', 'aab', 4],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'abb', 2],
  ['aa', 'aab', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'aab', 2],
  // ancestor entity abb
  ['abb', 'aab', 1],
]);

// test changes the parent_id of the aba -> aaa entity relation to abb
//      a
//      aa
//      ab
//   aba  abb
//      aaa aab
export const HIERARCHY_STORM_AFTER_RELATION_PARENT_ID_CHANGED_1 = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'abb', 3],
  ['a', 'aaa', 4],
  ['a', 'aab', 4],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'abb', 2],
  ['aa', 'aaa', 3],
  ['aa', 'aab', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'aaa', 2],
  ['ab', 'aab', 2],
  // ancestor entity abb
  ['abb', 'aab', 1],
  ['abb', 'aaa', 1],
]);

// test changes the parent_id of the ab -> aa entity relation to a
// because this means aa now links to its canonical children again, the other entity relations
// linking aaa to aba and aab to abb get ignored, as those entities have appeared earlier in the
// hierarchy, so this ends up looking exactly like our full canonical hierarchy in the ocean project
//          a
//    aa         ab
// aaa  aab   aba  abb
export const HIERARCHY_STORM_AFTER_RELATION_PARENT_ID_CHANGED_2 = [...INITIAL_HIERARCHY_OCEAN];

// test moves aab to below aa, and ab to below aab, resulting in:
//      a
//      aa
//      aab
//      ab
//   aba  abb
//   aaa
export const HIERARCHY_STORM_AFTER_MULTIPLE_RELATIONS_CHANGED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'aab', 2],
  ['a', 'ab', 3],
  ['a', 'aba', 4],
  ['a', 'abb', 4],
  ['a', 'aaa', 5],
  // ancestor entity aa
  ['aa', 'aab', 1],
  ['aa', 'ab', 2],
  ['aa', 'aba', 3],
  ['aa', 'abb', 3],
  ['aa', 'aaa', 4],
  // ancestor entity aab
  ['aab', 'ab', 1],
  ['aab', 'aba', 2],
  ['aab', 'abb', 2],
  ['aab', 'aaa', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'aaa', 2],
  // ancestor entity aba
  ['aba', 'aaa', 1],
]);

// adding a new entity relation record between aba and ab means that at the generation that was
// previously canonically connecting ab to both aba and abb, it will instead treat it as an
// alternative hierarchy generation, so only link aba via the entity relation, and drop the whole
// abb subtree
// a
// aa
// ab
// aba
// aaa
export const HIERARCHY_STORM_AFTER_ENTITY_RELATION_ADDED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'aaa', 4],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'aaa', 3],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'aaa', 2],
  // ancestor entity aba
  ['aba', 'aaa', 1],
]);

// entity abc is created below ab, entity aaaa below aaa, ac below a, and aca below ac
//                 a
//    aa           ab           ac
// aaa  aab   aba  abb  abc     aca
// aaaa
export const HIERARCHY_OCEAN_AFTER_ENTITIES_CREATED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 1],
  ['a', 'ac', 1],
  ['a', 'aaa', 2],
  ['a', 'aab', 2],
  ['a', 'aba', 2],
  ['a', 'abb', 2],
  ['a', 'abc', 2],
  ['a', 'aca', 2],
  ['a', 'aaaa', 3],
  // ancestor entity aa
  ['aa', 'aaa', 1],
  ['aa', 'aab', 1],
  ['aa', 'aaaa', 2],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'abc', 1],
  // ancestor entity ac
  ['ac', 'aca', 1],
  // ancestor entity aaa
  ['aaa', 'aaaa', 1],
]);

// entity abc is created below ab, entity aaaa below aaa, and ac below a, and aca below the new ac
// in hierarchy storm, the ac subtree is ignored as the alternative hierarchy is used at that
// generation, and ac is only linked to other entities canonically (i.e. via parent_id)
//         a
//        aa
//        ab
//   aba  abb  abc
//   aaa  aab
//  aaaa
export const HIERARCHY_STORM_AFTER_ENTITIES_CREATED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 2],
  ['a', 'aba', 3],
  ['a', 'abb', 3],
  ['a', 'abc', 3],
  ['a', 'aaa', 4],
  ['a', 'aab', 4],
  ['a', 'aaaa', 5],
  // ancestor entity aa
  ['aa', 'ab', 1],
  ['aa', 'aba', 2],
  ['aa', 'abb', 2],
  ['aa', 'abc', 2],
  ['aa', 'aaa', 3],
  ['aa', 'aab', 3],
  ['aa', 'aaaa', 4],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
  ['ab', 'abc', 1],
  ['ab', 'aaa', 2],
  ['ab', 'aab', 2],
  ['ab', 'aaaa', 3],
  // ancestor entity aba
  ['aba', 'aaa', 1],
  ['aba', 'aaaa', 2],
  // ancestor entity abb
  ['abb', 'aab', 1],
  // ancestor entity aaa
  ['aaa', 'aaaa', 1],
]);

// canonical types are changed from
// project, country, district, sub_district, case
// to
// project, country, facility
// so facilities are added in, and all districts, sub_districts, and cases are dropped
//          a
//    aa         ab
//            aba  abb
export const HIERARCHY_WIND_AFTER_CANONICAL_TYPES_CHANGED = expandEntityRelations([
  // ancestor entity a
  ['a', 'aa', 1],
  ['a', 'ab', 1],
  ['a', 'aba', 2],
  ['a', 'abb', 2],
  // ancestor entity ab
  ['ab', 'aba', 1],
  ['ab', 'abb', 1],
]);
