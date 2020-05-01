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
    },
  },
};
