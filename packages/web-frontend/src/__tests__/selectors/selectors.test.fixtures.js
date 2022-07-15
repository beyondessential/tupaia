export const state = {
  orgUnits: {
    orgUnitMap: {
      World: {
        World: { organisationUnitCode: 'World', name: 'World' },
        countryCode: 'World',
      },
      TO: {
        TO: {
          organisationUnitCode: 'TO',
          name: 'Tonga',
          parent: 'World',
        },
        TO_Haapai: {
          organisationUnitCode: 'TO_Haapai',
          name: "Ha'apai",
          parent: 'TO',
        },
        TO_HfevaHC: {
          organisationUnitCode: 'TO_HfevaHC',
          name: "Ha'afeva",
          parent: 'TO_Haapai',
        },
        TO_FoaMCH: {
          organisationUnitCode: 'TO_FoaMCH',
          name: 'Foa',
          parent: 'TO_Haapai',
        },
        countryCode: 'TO',
      },
      PG: {
        PG: {
          organisationUnitCode: 'PG',
          name: 'Papua New Guinea',
          parent: 'World',
        },
        PG_district_1: {
          organisationUnitCode: 'PG_district_1',
          name: 'District 1',
          parent: 'PG',
        },
        PG_district_2: {
          organisationUnitCode: 'PG_district_2',
          name: 'District 2',
          parent: 'PG',
        },
        PG_facility_1: {
          organisationUnitCode: 'PG_facility_1',
          name: 'Facility 1',
          parent: 'PG',
        },
        PG_facility_2: {
          organisationUnitCode: 'PG_facility_2',
          name: 'Facility 2',
          parent: 'PG_district_1',
        },
        PG_facility_3: {
          organisationUnitCode: 'PG_facility_3',
          name: 'Facility 3',
          parent: 'PG_district_1',
        },
        PG_facility_4: {
          organisationUnitCode: 'PG_facility_4',
          name: 'Facility 4',
          parent: 'PG_district_2',
        },
        PG_facility_5: {
          organisationUnitCode: 'PG_facility_5',
          name: 'Facility 5',
          parent: 'PG_district_1',
        },
        countryCode: 'PG',
      },
    },
  },
  project: {
    projects: [
      { code: 'explore', data: 4, bounds: 'BOUNDS_1' },
      { code: 'covidau', data: 6, bounds: 'BOUNDS_2' },
    ],
  },
  routing: {
    pathname: '/explore/TO/UNFPA',
    search: { MEASURE: 'abc%20123' },
  },
};
