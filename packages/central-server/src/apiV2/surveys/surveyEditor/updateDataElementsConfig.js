/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const { assertCanAddDataElementInGroup } = require('../assertCanAddDataElementInGroup');

/**
 * Given a data group, sets the config for those data elements to match (service type / dhis instance code etc).
 */
export const updateDataElementsConfig = async (models, dataGroup) => {
  const { service_type: serviceType, config } = dataGroup;

  const dataElementIds = (
    await models.dataElementDataGroup.find({ data_group_id: dataGroup.id })
  ).map(row => row.data_element_id);

  for (const dataElementId of dataElementIds) {
    const dataElement = await models.dataElement.findById(dataElementId);

    await assertCanAddDataElementInGroup(models, dataElement.code, dataGroup.code, {
      service_type: serviceType,
      config,
    });

    dataElement.service_type = serviceType;
    dataElement.config = config;

    dataElement.sanitizeConfig();
    await dataElement.save();
  }
};
