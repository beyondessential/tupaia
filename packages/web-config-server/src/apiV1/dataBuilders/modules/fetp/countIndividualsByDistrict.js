/**
 * count entities of type 'individual' by district and sub_district grouping by district
 */
export const countIndividualsByDistrict = async ({
  models,
  dataBuilderConfig,
  entity,
  fetchHierarchyId,
}) => {
  const hierarchyId = await fetchHierarchyId();
  const districts = await entity.getDescendantsOfType(hierarchyId, models.entity.types.DISTRICT);
  const subDistricts = await entity.getDescendantsOfType(
    hierarchyId,
    models.entity.types.SUB_DISTRICT,
  );
  const individuals = await entity.getDescendantsOfType(
    hierarchyId,
    models.entity.types.INDIVIDUAL,
  );

  function compare(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  const rows = districts
    .sort(compare)
    .map(district => {
      const districtCount = individuals.filter(i => i.parent_id == district.id).length;
      const childDistricts = subDistricts.filter(
        subDistrict => subDistrict.parent_id == district.id,
      );
      let totalCount = districtCount;
      const childRows = childDistricts.sort(compare).map(childDistricts => {
        const subDistrictCount = individuals.filter(i => i.parent_id == childDistricts.id).length;
        totalCount += subDistrictCount;
        return {
          categoryId: district.name,
          dataElement: childDistricts.name,
          CountColumn: subDistrictCount,
        };
      });
      const districtCountRow = {
        categoryId: district.name,
        dataElement: 'Provincial Level',
        CountColumn: districtCount,
      };
      const category = { category: district.name, CountColumn: totalCount };
      return [districtCountRow, ...childRows, category];
    })
    .flat();
  const returnData = {
    columns: [{ key: 'CountColumn', title: dataBuilderConfig.columns[0] }],
    rows,
  };
  return returnData;
};
