export const getSpoofData = (dataSourceSpec, options) => {
  return { results: analyticsData[dataSourceSpec.code[0]] };
};

const analyticsData = {
  SchPop003: [
    {
      dataElement: 'SchPop003',
      organisationUnit: 'LA_sch_706035',
      period: '20191202',
      value: 109,
    },
    {
      dataElement: 'SchPop003',
      organisationUnit: 'LA_sch_706036',
      period: '20191202',
      value: 10,
    },
    {
      dataElement: 'SchPop003',
      organisationUnit: 'LA_sch_706037',
      period: '20191202',
      value: 19,
    },
    {
      dataElement: 'SchPop003',
      organisationUnit: 'LA_sch_706038',
      period: '20191202',
      value: 9,
    },
  ],
  // Add as needed
};
