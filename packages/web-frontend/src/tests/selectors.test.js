/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { selectOrgUnit, selectOrgUnitChildren, selectOrgUnitsAsHierarchy } from '../selectors';
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

describe.only('selectors', () => {
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

    describe('selectOrgUnitsAsHierarchy', () => {
      it('recomputes by orgUnitMap', () => {
        let testState = {
          orgUnits: { orgUnitMap: { TO: { TO: { organisationUnitCode: 'TO', name: 'Tonga' } } } },
        };

        selectOrgUnitsAsHierarchy(testState);
        expect(selectOrgUnitsAsHierarchy.recomputations()).toEqual(1);

        testState = insertOrgUnit(testState, 'PG', {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
        });

        selectOrgUnitsAsHierarchy(testState);
        expect(selectOrgUnitsAsHierarchy.recomputations()).toEqual(2); //OrgUnitMap has changed, so recompute
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

    describe('selectOrgUnitsAsHierarchy', () => {
      it('can select orgUnits as a hierarchy', () => {
        const codeMatching = code => orgUnit => orgUnit.organisationUnitCode === code;
        const orgUnitsAsHierarchy = selectOrgUnitsAsHierarchy(state);
        expect(orgUnitsAsHierarchy.organisationUnitCode).toEqual('World');
        const TO = orgUnitsAsHierarchy.organisationUnitChildren.find(codeMatching('TO'));
        expect(TO.name).toEqual('Tonga');
        expect(TO.parent.name).toEqual('World');
        const TO_Haapai = TO.organisationUnitChildren.find(codeMatching('TO_Haapai'));
        expect(TO_Haapai.name).toEqual("Ha'apai");
        expect(TO_Haapai.parent.name).toEqual('Tonga');
        const TO_HfevaHC = TO_Haapai.organisationUnitChildren.find(codeMatching('TO_HfevaHC'));
        const TO_FoaMCH = TO_Haapai.organisationUnitChildren.find(codeMatching('TO_FoaMCH'));
        expect(TO_HfevaHC.name).toEqual("Ha'afeva");
        expect(TO_HfevaHC.parent.name).toEqual("Ha'apai");
        expect(TO_FoaMCH.name).toEqual('Foa');
        expect(TO_FoaMCH.parent.name).toEqual("Ha'apai");
      });
    });
  });
});
