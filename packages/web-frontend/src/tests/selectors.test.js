/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  selectOrgUnit,
  selectOrgUnitChildren,
  selectCurrentOrgUnit,
  selectOrgUnitSiblings,
} from '../selectors';
import { state } from './selectors.test.state';

const insertOrgUnit = (testState, country, orgUnit) => {
  return {
    ...testState,
    orgUnits: {
      ...testState.orgUnits,
      orgUnitMap: {
        ...testState.orgUnits.orgUnitMap,
        [country]: {
          ...testState.orgUnits.orgUnitMap[country],
          [orgUnit.organisationUnitCode]: orgUnit,
        },
      },
    },
  };
};

describe('selectors', () => {
  describe('memoization', () => {
    describe('selectOrgUnit', () => {
      it('recomputes by country', () => {
        let testState = {
          orgUnits: { orgUnitMap: { TO: { TO: { organisationUnitCode: 'TO', name: 'Tonga' } } } },
        };

        selectOrgUnit(testState, 'TO');
        expect(selectOrgUnit.recomputations()).toEqual(1);

        testState = insertOrgUnit(testState, 'PG', {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        });

        selectOrgUnit(testState, 'TO');
        expect(selectOrgUnit.recomputations()).toEqual(1); // Country has not changed, so don't recompute

        testState = insertOrgUnit(testState, 'TO', {
          organisationUnitCode: 'TO_HfevaHC',
          name: "Ha'afeva",
        });

        selectOrgUnit(testState, 'TO');
        expect(selectOrgUnit.recomputations()).toEqual(2); // Country has changed, recompute
      });
    });

    describe('selectCurrentOrgUnit', () => {
      it('recomputes by org unit', () => {
        let testState = {
          global: { currentOrganisationUnitCode: 'TO' },
          orgUnits: { orgUnitMap: { TO: { TO: { organisationUnitCode: 'TO', name: 'Tonga' } } } },
        };

        selectCurrentOrgUnit(testState);
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1);

        testState = insertOrgUnit(testState, 'PG', {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        });

        selectCurrentOrgUnit(testState);
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1); // Country has not changed, so don't recompute

        testState = insertOrgUnit(testState, 'TO', {
          organisationUnitCode: 'TO_HfevaHC',
          name: "Ha'afeva",
        });

        selectCurrentOrgUnit(testState);
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1); // Country has changed, but not org unit, so don't recompute

        selectCurrentOrgUnit({ ...testState, global: { currentOrganisationUnitCode: 'PG' } });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(2); // Org unit has changed, recompute

        testState = insertOrgUnit(testState, 'TO', {
          organisationUnitCode: 'TO',
          name: 'New Tonga Name',
        });

        selectCurrentOrgUnit(testState);
        expect(selectCurrentOrgUnit.recomputations()).toEqual(3); // Org unit has changed, recompute
      });
    });

    describe('selectOrgUnitChildren', () => {
      it('recomputes by orgUnitMap', () => {
        let testState = {
          orgUnits: { orgUnitMap: { TO: { TO: { organisationUnitCode: 'TO', name: 'Tonga' } } } },
        };

        selectOrgUnitChildren(testState, 'TO');
        expect(selectOrgUnitChildren.recomputations()).toEqual(1);

        testState = insertOrgUnit(testState, 'PG', {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        });

        selectOrgUnitChildren(testState, 'TO');
        expect(selectOrgUnitChildren.recomputations()).toEqual(2); //OrgUnitMap has changed, so recompute
      });
    });

    describe('selectOrgUnitSiblings', () => {
      it('recomputes by orgUnitMap', () => {
        let testState = {
          orgUnits: { orgUnitMap: { TO: { TO: { organisationUnitCode: 'TO', name: 'Tonga' } } } },
        };

        selectOrgUnitSiblings(testState, 'TO');
        expect(selectOrgUnitSiblings.recomputations()).toEqual(1);

        testState = insertOrgUnit(testState, 'PG', {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        });

        selectOrgUnitSiblings(testState, 'TO');
        expect(selectOrgUnitSiblings.recomputations()).toEqual(2); //OrgUnitMap has changed, so recompute
      });
    });
  });
  describe('functionality', () => {
    describe('selectOrgUnit', () => {
      it('can select world', () => {
        expect(selectOrgUnit(state, 'World')).toEqual(state.orgUnits.orgUnitMap.World.World);
      });
      it('can select country', () => {
        expect(selectOrgUnit(state, 'TO')).toEqual(state.orgUnits.orgUnitMap.TO.TO);
      });
      it('can select facility', () => {
        expect(selectOrgUnit(state, 'TO_HfevaHC')).toEqual(state.orgUnits.orgUnitMap.TO.TO_HfevaHC);
      });
      it('can select undefined', () => {
        expect(selectOrgUnit(state, undefined)).toEqual(undefined);
      });
    });

    describe('selectCurrentOrgUnit', () => {
      it('can select from state', () => {
        expect(selectCurrentOrgUnit(state)).toEqual(state.orgUnits.orgUnitMap.TO.TO);
      });
      it('can select if code is undefined', () => {
        expect(selectCurrentOrgUnit({ ...state, global: {} })).toEqual({});
      });
      it('Empty org unit is always shallowly equal', () => {
        const orgUnit1 = selectCurrentOrgUnit({
          ...state,
          global: { currentOrganisationUnitCode: undefined },
        });
        const orgUnit2 = selectCurrentOrgUnit({
          ...state,
          global: { currentOrganisationUnitCode: 'DOES_NOT_EXIST' },
        });
        expect(orgUnit1).toBe(orgUnit2);
      });
    });

    describe('selectOrgUnitChildren', () => {
      it('can select children of world', () => {
        expect(selectOrgUnitChildren(state, 'World')).toContain(state.orgUnits.orgUnitMap.TO.TO);
      });
      it('can select children of country', () => {
        expect(selectOrgUnitChildren(state, 'TO')).toContain(
          state.orgUnits.orgUnitMap.TO.TO_Haapai,
        );
      });
      it('can select children of facility', () => {
        const children = selectOrgUnitChildren(state, 'TO_Haapai');
        expect(children).toContain(state.orgUnits.orgUnitMap.TO.TO_HfevaHC);
        expect(children).toContain(state.orgUnits.orgUnitMap.TO.TO_FoaMCH);
      });
      it('can select children of undefined', () => {
        expect(selectOrgUnitChildren(state, undefined)).toEqual(undefined);
      });
    });

    describe('selectOrgUnitSiblings', () => {
      it('can select siblings of world', () => {
        expect(selectOrgUnitSiblings(state, 'World')).toEqual([]);
      });
      it('can select siblings of country', () => {
        expect(selectOrgUnitSiblings(state, 'TO')).toEqual([state.orgUnits.orgUnitMap.PG.PG]);
      });
      it('can select siblings of district, including facility', () => {
        expect(selectOrgUnitSiblings(state, 'PG_district_1')).toEqual([
          state.orgUnits.orgUnitMap.PG.PG_district_2,
          state.orgUnits.orgUnitMap.PG.PG_facility_1,
        ]);
      });
      it('can select multiple siblings of facility', () => {
        expect(selectOrgUnitSiblings(state, 'PG_facility_2')).toEqual([
          state.orgUnits.orgUnitMap.PG.PG_facility_3,
          state.orgUnits.orgUnitMap.PG.PG_facility_5,
        ]);
      });
      it('can select siblings of facility with no siblings', () => {
        expect(selectOrgUnitSiblings(state, 'PG_facility_4')).toEqual([]);
      });
      it('can select siblings of undefined', () => {
        expect(selectOrgUnitSiblings(state, undefined)).toEqual([]);
      });
    });
  });
});
