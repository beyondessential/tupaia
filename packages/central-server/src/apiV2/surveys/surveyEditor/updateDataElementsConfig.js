import { dataElementMustMatchDataGroupServiceType } from '../dataElementMustMatchDataGroupServiceType';

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

    // Only update the data element service type if we have to, i.e. if it is not a Tupaia data element. This is because if we update all the data elements to have the same service type as the data group when they don't need to, if the data element service type has been changed manually, then we can unintentionally break visualisations when we reimport survey questions.

    if (!dataElementMustMatchDataGroupServiceType(dataElement.service_type)) continue;

    dataElement.service_type = serviceType;
    dataElement.config = config;

    dataElement.sanitizeConfig();
    await dataElement.save();
  }
};
