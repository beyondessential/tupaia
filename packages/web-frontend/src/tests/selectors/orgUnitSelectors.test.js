/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  selectOrgUnit,
  selectCurrentOrgUnit,
  selectOrgUnitChildren,
  selectOrgUnitSiblings,
} from '../../selectors';
import { state } from './selectors.test.fixtures';

const shallowEqualTonga = { TO: { organisationUnitCode: 'TO', name: 'Tonga' } };
const testState1 = {
  orgUnits: { orgUnitMap: { TO: shallowEqualTonga } },
  routing: {
    pathname: '/PROJECT_1/TO/A%20DASHBOARD',
    search: { MEASURE: 'abc%20123' },
  },
};

// A different country changes
const testState2 = {
  orgUnits: {
    orgUnitMap: {
      TO: shallowEqualTonga,
      PG: {
        PG: {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        },
      },
    },
  },
  routing: {
    pathname: '/PROJECT_1/TO/A%20DASHBOARD',
    search: { MEASURE: 'abc%20123' },
  },
};

// Tonga country map now changes
const testState3 = {
  orgUnits: {
    orgUnitMap: {
      TO: {
        ...shallowEqualTonga,
        TO_HfevaHC: {
          organisationUnitCode: 'TO_HfevaHC',
          name: "Ha'afeva",
        },
      },
      PG: {
        PG: {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        },
      },
    },
  },
  routing: {
    pathname: '/PROJECT_1/TO/A%20DASHBOARD',
    search: { MEASURE: 'abc%20123' },
  },
};

describe('orgUnitSelectors', () => {
  describe('memoization', () => {
    describe('selectOrgUnit', () => {
      it('recomputes by country', () => {
        selectOrgUnit(testState1, 'TO');
        expect(selectOrgUnit.recomputations()).toEqual(1);

        selectOrgUnit(testState2, 'TO');
        expect(selectOrgUnit.recomputations()).toEqual(1); // Country has not changed, so don't recompute

        selectOrgUnit(testState3, 'TO');
        expect(selectOrgUnit.recomputations()).toEqual(2); // Country has changed, recompute
      });
    });

    describe('selectCurrentOrgUnit', () => {
      it('recomputes by code or by state change', () => {
        const routing1 = {
          pathname: '/PROJECT_1/TO/A%20DASHBOARD',
          search: { MEASURE: 'abc%20123' },
        };

        const routing2 = {
          pathname: '/PROJECT_2/TO/ANOTHER%20DASHBOARD',
          search: { MEASURE: 'abc%20123' },
        };

        const routing3 = {
          pathname: '/PROJECT_2/TO_HfevaHC/ANOTHER%20DASHBOARD',
          search: { MEASURE: 'abc%20123' },
        };
        const testState4 = {
          orgUnits: {
            orgUnitMap: {
              TO: {
                TO: {
                  organisationUnitCode: 'TO',
                  name: 'Tonga version 2',
                },
              },
            },
          },
        };

        selectCurrentOrgUnit({ ...testState1, routing: routing1 });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1);

        selectCurrentOrgUnit({ ...testState1, routing: routing1, someOtherState: 'irrelevant' });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectCurrentOrgUnit({ ...testState2, routing: routing1 });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1); // Org unit array has changed, but not the relevant country, do not recompute

        selectCurrentOrgUnit({ ...testState3, routing: routing1 });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(1); // The relevant country has changed, but the org unit itself hasn't, don't recompute

        selectCurrentOrgUnit({ ...testState4, routing: routing1 });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(2); // The org unit itself has changed, recompute

        selectCurrentOrgUnit({ ...testState4, routing: routing2 });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(2); // Routing has changed but code has not, do not recompute

        selectCurrentOrgUnit({ ...testState4, routing: routing3 });
        expect(selectCurrentOrgUnit.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });

    describe('selectOrgUnitChildren', () => {
      it('recomputes by orgUnitMap', () => {
        selectOrgUnitChildren(testState1, 'TO');
        expect(selectOrgUnitChildren.recomputations()).toEqual(1);

        selectOrgUnitChildren(testState2, 'TO');
        expect(selectOrgUnitChildren.recomputations()).toEqual(2); // OrgUnitMap has changed, so recompute
      });
    });

    describe('selectOrgUnitSiblings', () => {
      it('recomputes by orgUnitMap', () => {
        selectOrgUnitSiblings(testState1, 'TO');
        expect(selectOrgUnitSiblings.recomputations()).toEqual(1);

        selectOrgUnitSiblings(testState2, 'TO');
        expect(selectOrgUnitSiblings.recomputations()).toEqual(2); // OrgUnitMap has changed, so recompute
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

      it('can select if the path is invalid', () => {
        expect(
          selectCurrentOrgUnit({ ...state, routing: { pathname: 'NOT_A_VALID_PATH' } }),
        ).toEqual({});
      });

      it('Empty org unit is always shallowly equal', () => {
        const orgUnit1 = selectCurrentOrgUnit({
          ...state,
          routing: { pathname: 'NOT_A_VALID_PATH #1' },
        });
        const orgUnit2 = selectCurrentOrgUnit({
          ...state,
          routing: { pathname: 'NOT_A_VALID_PATH #2' },
        });
        expect(orgUnit1).toBe(orgUnit2);
      });
    });

    describe('selectOrgUnitChildren', () => {
      it.skip('can select children of world', () => {
        expect(selectOrgUnitChildren(state, 'World')).toContain(state.orgUnits.orgUnitMap.TO.TO);
      });

      it.skip('can select children of a project', () => {
        expect(selectOrgUnitChildren(state, 'explore')).toContain(state.orgUnits.orgUnitMap.TO.TO);
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

      it.skip('can select siblings of country', () => {
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
