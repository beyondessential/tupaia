import { getDataSourceEntityType } from 'apiV1/dataBuilders/helpers';

// Case insensitive string comparison
const compareStrings = (stringA, stringB) => {
  const a = stringA.toUpperCase();
  const b = stringB.toUpperCase();

  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export const multiPercentagePerOrgUnit = async (
  { dataBuilderConfig, query, entity },
  aggregator,
) => {
  const { dataElementCodes, dataServices } = dataBuilderConfig;
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);

  const tempData = {};
  const entities = await entity.getDescendantsOfType(getDataSourceEntityType(dataBuilderConfig));
  results.forEach(analyticRow => {
    if (!tempData[analyticRow.organisationUnit]) {
      const { name } = entities.find(e => e.code === analyticRow.organisationUnit);
      tempData[analyticRow.organisationUnit] = { code: 'oranisationUnit', name };
    }
    tempData[analyticRow.organisationUnit][analyticRow.dataElement] = analyticRow.value;
  });

  // Sort results by organisation unit name
  return {
    data: Object.values(tempData).sort((unitA, unitB) => compareStrings(unitA.name, unitB.name)),
  };
};

/*
  Will return the following :

{
   "type":"chart",
   "chartType":"bar",
   "valueType":"percentage",
   "xName":"Facility",
   "yName":"%",
   "name":"Service Status By Facility",
   "viewId":"30",
   "presentationOptions":{
      "PEHS_Green":{
         "color":"#279A63",
         "label":"Green"
      },
      "PEHS_Orange":{
         "color":"#EE9A30",
         "label":"Orange"
      },
      "PEHS_Red":{
         "color":"#EE4230",
         "label":"Red"
      }
   },
   "organisationUnitCode":"TO",
   "dashboardGroupId":"18",
   "data":[
      {
         "code":"oranisationUnit",
         "name":"Kolovai",
         "PEHS_Green":0.07,
         "PEHS_Orange":0.63,
         "PEHS_Red":0.31
      },
      {
         "code":"oranisationUnit",
         "name":"Kolofo'ou",
         "PEHS_Green":0.09,
         "PEHS_Orange":0.53,
         "PEHS_Red":0.38
      },
      {
         "code":"oranisationUnit",
         "name":"Kolomotu'a 1",
         "PEHS_Red":0.38,
         "PEHS_Orange":0.53,
         "PEHS_Green":0.09
      },
      {
         "code":"oranisationUnit",
         "name":"Public Health Services",
         "PEHS_Green":0.27,
         "PEHS_Orange":0.57,
         "PEHS_Red":0.16
      },
      {
         "code":"oranisationUnit",
         "name":"Nukunuku",
         "PEHS_Orange":0.63,
         "PEHS_Red":0.31,
         "PEHS_Green":0.07
      },
      {
         "code":"oranisationUnit",
         "name":"Niu'ui Hospital",
         "PEHS_Green":0.08,
         "PEHS_Red":0.3,
         "PEHS_Orange":0.62
      },
      {
         "code":"oranisationUnit",
         "name":"Ha'afeva",
         "PEHS_Orange":0.61,
         "PEHS_Red":0.37,
         "PEHS_Green":0.02
      },
      {
         "code":"oranisationUnit",
         "name":"Tefisi",
         "PEHS_Orange":0.63,
         "PEHS_Green":0.07,
         "PEHS_Red":0.31
      },
      {
         "code":"oranisationUnit",
         "name":"Houma",
         "PEHS_Green":0.33,
         "PEHS_Orange":0.56,
         "PEHS_Red":0.11
      },
      {
         "code":"oranisationUnit",
         "name":"Kolomotu'a 2",
         "PEHS_Red":0.38,
         "PEHS_Green":0.09,
         "PEHS_Orange":0.53
      },
      {
         "code":"oranisationUnit",
         "name":"Ta'anea MCH",
         "PEHS_Green":0.07,
         "PEHS_Orange":0.63,
         "PEHS_Red":0.31
      },
      {
         "code":"oranisationUnit",
         "name":"Haveluloto",
         "PEHS_Red":0.38,
         "PEHS_Orange":0.53,
         "PEHS_Green":0.09
      },
      {
         "code":"oranisationUnit",
         "name":"Ma'ufanga",
         "PEHS_Green":0.09,
         "PEHS_Orange":0.53,
         "PEHS_Red":0.38
      },
      {
         "code":"oranisationUnit",
         "name":"Hunga",
         "PEHS_Green":0.02,
         "PEHS_Orange":0.61,
         "PEHS_Red":0.37
      },
      {
         "code":"oranisationUnit",
         "name":"Ngu Hospital",
         "PEHS_Red":0.25,
         "PEHS_Green":0.22,
         "PEHS_Orange":0.53
      },
      {
         "code":"oranisationUnit",
         "name":"Mu'a",
         "PEHS_Orange":0.63,
         "PEHS_Red":0.31,
         "PEHS_Green":0.07
      },
      {
         "code":"oranisationUnit",
         "name":"Kauvai",
         "PEHS_Orange":0.53,
         "PEHS_Green":0.09,
         "PEHS_Red":0.38
      },
      {
         "code":"oranisationUnit",
         "name":"Niuatopotapu",
         "PEHS_Red":0.32,
         "PEHS_Green":0.09,
         "PEHS_Orange":0.59
      },
      {
         "code":"oranisationUnit",
         "name":"Falevai",
         "PEHS_Red":0.37,
         "PEHS_Green":0.02,
         "PEHS_Orange":0.61
      },
      {
         "code":"oranisationUnit",
         "name":"Foa",
         "PEHS_Orange":0.53,
         "PEHS_Red":0.38,
         "PEHS_Green":0.09
      },
      {
         "code":"oranisationUnit",
         "name":"Niuafo'ou",
         "PEHS_Orange":0.59,
         "PEHS_Green":0.09,
         "PEHS_Red":0.32
      },
      {
         "code":"oranisationUnit",
         "name":"Niu'eiki Hospital",
         "PEHS_Red":0.25,
         "PEHS_Green":0.56,
         "PEHS_Orange":0.19
      },
      {
         "code":"oranisationUnit",
         "name":"Fua'amotu",
         "PEHS_Orange":0.63,
         "PEHS_Green":0.07,
         "PEHS_Red":0.31
      },
      {
         "code":"oranisationUnit",
         "name":"Nomuka",
         "PEHS_Red":0.37,
         "PEHS_Orange":0.61,
         "PEHS_Green":0.02
      },
      {
         "code":"oranisationUnit",
         "name":"Kolonga",
         "PEHS_Orange":0.63,
         "PEHS_Green":0.07,
         "PEHS_Red":0.31
      },
      {
         "code":"oranisationUnit",
         "name":"Vaiola Hospital",
         "PEHS_Orange":0.13,
         "PEHS_Red":0,
         "PEHS_Green":0.87
      },
      {
         "code":"oranisationUnit",
         "name":"Vaini",
         "PEHS_Orange":0.63,
         "PEHS_Green":0.07,
         "PEHS_Red":0.31
      },
      {
         "code":"oranisationUnit",
         "name":"Tofoa",
         "PEHS_Orange":0.53,
         "PEHS_Red":0.38,
         "PEHS_Green":0.09
      },
      {
         "code":"oranisationUnit",
         "name":"Pea",
         "PEHS_Red":0.38,
         "PEHS_Green":0.09,
         "PEHS_Orange":0.53
      },
      {
         "code":"oranisationUnit",
         "name":"Uiha",
         "PEHS_Orange":0.53,
         "PEHS_Green":0.09,
         "PEHS_Red":0.38
      }
   ]
}

*/
