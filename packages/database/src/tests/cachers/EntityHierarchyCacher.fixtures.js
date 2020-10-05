/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// canonical hierarchy splits into two children at each of two generations
//          a
//    aa         ab
// aaa  aab   aba  abb
const ENTITIES = [
  { id: 'entity_a_test', name: 'Entity A', parent_id: null },
  { id: 'entity_aa_test', name: 'Entity AA', parent_id: 'entity_a_test' },
  { id: 'entity_ab_test', name: 'Entity AB', parent_id: 'entity_a_test' },
  { id: 'entity_aaa_test', name: 'Entity AAA', parent_id: 'entity_aa_test' },
  { id: 'entity_aab_test', name: 'Entity AAB', parent_id: 'entity_aa_test' },
  { id: 'entity_aba_test', name: 'Entity ABA', parent_id: 'entity_ab_test' },
  { id: 'entity_abb_test', name: 'Entity ABB', parent_id: 'entity_ab_test' },
];

// two hierarchies to play with
const ENTITY_HIERARCHIES = [{ id: 'hierarchy_a_test' }, { id: 'hierarchy_b_test' }];

// a project for each of the two hierarchies
const PROJECTS = [
  {
    code: 'project_a_test',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_a_test',
  },
  {
    code: 'project_b_test',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
];

// - project a follows the canonical hierarchy exactly
// - project b moves the ab subtree to live below aa, to replace aaa and aab, and then aaa below
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
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_aa_test',
    child_id: 'entity_ab_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_aba_test',
    child_id: 'entity_aaa_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_abb_test',
    child_id: 'entity_aab_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
];

export const TEST_DATA_TO_POPULATE = {
  entity: ENTITIES,
  entityHierarchy: ENTITY_HIERARCHIES,
  project: PROJECTS,
  entityRelation: ENTITY_RELATIONS,
};

export const TEST_DATA_TO_DEPOPULATE = {
  entityRelation: ENTITY_RELATIONS,
  project: PROJECTS,
  entity: ENTITIES,
  entityHierarchy: ENTITY_HIERARCHIES,
};

export const INITIAL_HIERARCHY_A = [
  // ancestor entity a
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aa_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_ab_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aaa_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aba_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_abb_test', generational_distance: 2 },
  // ancestor entity aa
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aaa_test', generational_distance: 1 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
  // ancestor entity ab
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aba_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_abb_test', generational_distance: 1 },
];

export const INITIAL_HIERARCHY_B = [
  // ancestor entity a
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aa_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_ab_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aba_test', generational_distance: 3 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_abb_test', generational_distance: 3 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aaa_test', generational_distance: 4 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 4 },
  // ancestor entity aa
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_ab_test', generational_distance: 1 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aba_test', generational_distance: 2 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_abb_test', generational_distance: 2 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aaa_test', generational_distance: 3 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aab_test', generational_distance: 3 },
  // ancestor entity ab
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aba_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_abb_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aaa_test', generational_distance: 2 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  // ancestor entity aba
  { ancestor_id: 'entity_aba_test', descendant_id: 'entity_aaa_test', generational_distance: 1 },
  // ancestor entity abb
  { ancestor_id: 'entity_abb_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
];

export const HIERARCHY_B_AFTER_ENTITY_AAA_DELETED = [
  // ancestor entity a
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aa_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_ab_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aba_test', generational_distance: 3 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_abb_test', generational_distance: 3 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 4 },
  // ancestor entity aa
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_ab_test', generational_distance: 1 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aba_test', generational_distance: 2 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_abb_test', generational_distance: 2 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aab_test', generational_distance: 3 },
  // ancestor entity ab
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aba_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_abb_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  // ancestor entity abb
  { ancestor_id: 'entity_abb_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
];

export const HIERARCHY_B_AFTER_MULTIPLE_ENTITIES_DELETED = [
  // ancestor entity a
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aa_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  // ancestor entity aa
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
];

export const HIERARCHY_B_AFTER_RELATION_AA_AB_DELETED = [
  // ancestor entity a
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aa_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aaa_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  // ancestor entity aa
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aaa_test', generational_distance: 1 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
];

// strangely enough, after deleting a -> aa, it means the canonical structure takes back over, but
// with aaa and aab still _also_ attached to the end of aba and abb
export const HIERARCHY_B_AFTER_MULTIPLE_RELATIONS_DELETED = [
  // ancestor entity a
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aa_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_ab_test', generational_distance: 1 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aaa_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aba_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_abb_test', generational_distance: 2 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aaa_test', generational_distance: 3 },
  { ancestor_id: 'entity_a_test', descendant_id: 'entity_aab_test', generational_distance: 3 },
  // ancestor entity aa
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aaa_test', generational_distance: 1 },
  { ancestor_id: 'entity_aa_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
  // ancestor entity ab
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aba_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_abb_test', generational_distance: 1 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aaa_test', generational_distance: 2 },
  { ancestor_id: 'entity_ab_test', descendant_id: 'entity_aab_test', generational_distance: 2 },
  // ancestor entity aba
  { ancestor_id: 'entity_aba_test', descendant_id: 'entity_aaa_test', generational_distance: 1 },
  // ancestor entity abb
  { ancestor_id: 'entity_abb_test', descendant_id: 'entity_aab_test', generational_distance: 1 },
];
