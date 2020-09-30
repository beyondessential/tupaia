/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// canonical hierarchy is a - k, with each entity having the previous letter as its parent
const ENTITIES = [
  { id: 'entity_a_test', name: 'Entity A', parent_id: null },
  { id: 'entity_b_test', name: 'Entity B', parent_id: 'entity_a_test' },
  { id: 'entity_c_test', name: 'Entity C', parent_id: 'entity_b_test' },
  { id: 'entity_d_test', name: 'Entity D', parent_id: 'entity_c_test' },
  { id: 'entity_e_test', name: 'Entity E', parent_id: 'entity_d_test' },
  { id: 'entity_f_test', name: 'Entity F', parent_id: 'entity_e_test' },
  { id: 'entity_g_test', name: 'Entity G', parent_id: 'entity_f_test' },
  { id: 'entity_h_test', name: 'Entity H', parent_id: 'entity_g_test' },
  { id: 'entity_i_test', name: 'Entity I', parent_id: 'entity_h_test' },
  { id: 'entity_j_test', name: 'Entity J', parent_id: 'entity_i_test' },
  { id: 'entity_k_test', name: 'Entity K', parent_id: 'entity_j_test' },
];

// two hierarchies to play with
const ENTITY_HIERARCHIES = [{ id: 'hierarchy_a_test' }, { id: 'hierarchy_b_test' }];

// a project for each of the two hierarchies
const PROJECTS = [
  {
    code: 'project_a_test',
    name: 'Project A',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_a_test',
  },
  {
    code: 'project_b_test',
    name: 'Project B',
    entity_id: 'entity_a_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
];

// - project a follows the canonical hierarchy exactly
// - project b lifts all entities from c to g (inclusive) up to a single generation below b,
//   then from h as a child of c, with the canonical hierarchy continuing the chain below that
const ENTITY_RELATIONS = [
  {
    parent_id: 'entity_b_test',
    child_id: 'entity_c_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_b_test',
    child_id: 'entity_d_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_b_test',
    child_id: 'entity_e_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_b_test',
    child_id: 'entity_f_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_b_test',
    child_id: 'entity_g_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
  {
    parent_id: 'entity_c_test',
    child_id: 'entity_h_test',
    entity_hierarchy_id: 'hierarchy_b_test',
  },
];

export const TEST_DATA = {
  entity: ENTITIES,
  entityHierarchy: ENTITY_HIERARCHIES,
  project: PROJECTS,
  entityRelation: ENTITY_RELATIONS,
};

export const EXPECTED_INITIAL_ANCESTOR_DESCENDANT_RELATIONS = {
  project_a_test: [
    // ancestor entity a (all other entities are descendants)
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_b_test', generational_distance: 1 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_c_test', generational_distance: 2 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_d_test', generational_distance: 3 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_e_test', generational_distance: 4 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_f_test', generational_distance: 5 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_g_test', generational_distance: 6 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_h_test', generational_distance: 7 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_i_test', generational_distance: 8 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_j_test', generational_distance: 9 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_k_test', generational_distance: 10 },
    // ancestor entity b (the nine entities below b)
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_c_test', generational_distance: 1 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_d_test', generational_distance: 2 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_e_test', generational_distance: 3 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_f_test', generational_distance: 4 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_g_test', generational_distance: 5 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_h_test', generational_distance: 6 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_i_test', generational_distance: 7 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_j_test', generational_distance: 8 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_k_test', generational_distance: 9 },
    // ancestor entity c (the eight entities below c)
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_d_test', generational_distance: 1 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_e_test', generational_distance: 2 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_f_test', generational_distance: 3 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_g_test', generational_distance: 4 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_h_test', generational_distance: 5 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_i_test', generational_distance: 6 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_j_test', generational_distance: 7 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_k_test', generational_distance: 8 },
    // ancestor entity d (the seven entities below d)
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_e_test', generational_distance: 1 },
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_f_test', generational_distance: 2 },
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_g_test', generational_distance: 3 },
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_h_test', generational_distance: 4 },
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_i_test', generational_distance: 5 },
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_j_test', generational_distance: 6 },
    { ancestor_id: 'entity_d_test', descendant_id: 'entity_k_test', generational_distance: 7 },
    // ancestor entity e (the six entities below e)
    { ancestor_id: 'entity_e_test', descendant_id: 'entity_f_test', generational_distance: 1 },
    { ancestor_id: 'entity_e_test', descendant_id: 'entity_g_test', generational_distance: 2 },
    { ancestor_id: 'entity_e_test', descendant_id: 'entity_h_test', generational_distance: 3 },
    { ancestor_id: 'entity_e_test', descendant_id: 'entity_i_test', generational_distance: 4 },
    { ancestor_id: 'entity_e_test', descendant_id: 'entity_j_test', generational_distance: 5 },
    { ancestor_id: 'entity_e_test', descendant_id: 'entity_k_test', generational_distance: 6 },
    // ancestor entity f (the five entities below f)
    { ancestor_id: 'entity_f_test', descendant_id: 'entity_g_test', generational_distance: 1 },
    { ancestor_id: 'entity_f_test', descendant_id: 'entity_h_test', generational_distance: 2 },
    { ancestor_id: 'entity_f_test', descendant_id: 'entity_i_test', generational_distance: 3 },
    { ancestor_id: 'entity_f_test', descendant_id: 'entity_j_test', generational_distance: 4 },
    { ancestor_id: 'entity_f_test', descendant_id: 'entity_k_test', generational_distance: 5 },
    // ancestor entity g (the four entities below g)
    { ancestor_id: 'entity_g_test', descendant_id: 'entity_h_test', generational_distance: 1 },
    { ancestor_id: 'entity_g_test', descendant_id: 'entity_i_test', generational_distance: 2 },
    { ancestor_id: 'entity_g_test', descendant_id: 'entity_j_test', generational_distance: 3 },
    { ancestor_id: 'entity_g_test', descendant_id: 'entity_k_test', generational_distance: 4 },
    // ancestor entity h (the three entities below h)
    { ancestor_id: 'entity_h_test', descendant_id: 'entity_i_test', generational_distance: 1 },
    { ancestor_id: 'entity_h_test', descendant_id: 'entity_j_test', generational_distance: 2 },
    { ancestor_id: 'entity_h_test', descendant_id: 'entity_k_test', generational_distance: 3 },
    // ancestor entity i ("j" and "k")
    { ancestor_id: 'entity_i_test', descendant_id: 'entity_j_test', generational_distance: 1 },
    { ancestor_id: 'entity_i_test', descendant_id: 'entity_k_test', generational_distance: 2 },
    // ancestor entity j (just "k")
    { ancestor_id: 'entity_j_test', descendant_id: 'entity_k_test', generational_distance: 1 },
  ],
  project_b_test: [
    // ancestor entity a (all other entities are descendants through some tree)
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_b_test', generational_distance: 1 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_c_test', generational_distance: 2 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_d_test', generational_distance: 2 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_e_test', generational_distance: 2 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_f_test', generational_distance: 2 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_g_test', generational_distance: 2 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_h_test', generational_distance: 3 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_i_test', generational_distance: 4 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_j_test', generational_distance: 5 },
    { ancestor_id: 'entity_a_test', descendant_id: 'entity_k_test', generational_distance: 6 },
    // ancestor entity b (all entities other than a are below b through some tree)
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_c_test', generational_distance: 1 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_d_test', generational_distance: 1 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_e_test', generational_distance: 1 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_f_test', generational_distance: 1 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_g_test', generational_distance: 1 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_h_test', generational_distance: 2 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_i_test', generational_distance: 3 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_j_test', generational_distance: 4 },
    { ancestor_id: 'entity_b_test', descendant_id: 'entity_k_test', generational_distance: 5 },
    // entities d, e, f, and g have no descendants in this hierarchy, but c has h attached via entity relation,
    // and all of h's descendants below that)
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_h_test', generational_distance: 1 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_i_test', generational_distance: 2 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_j_test', generational_distance: 3 },
    { ancestor_id: 'entity_c_test', descendant_id: 'entity_k_test', generational_distance: 4 },
    // ancestor entity h (the three entities below h)
    { ancestor_id: 'entity_h_test', descendant_id: 'entity_i_test', generational_distance: 1 },
    { ancestor_id: 'entity_h_test', descendant_id: 'entity_j_test', generational_distance: 2 },
    { ancestor_id: 'entity_h_test', descendant_id: 'entity_k_test', generational_distance: 3 },
    // ancestor entity i ("j" and "k")
    { ancestor_id: 'entity_i_test', descendant_id: 'entity_j_test', generational_distance: 1 },
    { ancestor_id: 'entity_i_test', descendant_id: 'entity_k_test', generational_distance: 2 },
    // ancestor entity j (just "k")
    { ancestor_id: 'entity_j_test', descendant_id: 'entity_k_test', generational_distance: 1 },
  ],
};
