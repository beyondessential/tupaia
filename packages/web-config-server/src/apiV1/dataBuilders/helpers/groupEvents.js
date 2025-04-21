import { getEventsThatSatisfyConditions } from './checkAgainstConditions';

const getOrgUnits = async (models, { parentCode, type, hierarchyId }) => {
  const parentOrgUnit = await models.entity.findOne({ code: parentCode });
  return parentOrgUnit.getDescendantsOfType(hierarchyId, type);
};

/**
 * Given an object of eventsByOrgUnitCode, returns the same object with the code changed to name, but
 * disambiguated, e.g. 'Melbourne', 'Other', 'Other (1)'
 *
 * @param allOrgUnits
 * @param eventsByOrgUnitCode
 * @returns {{}}
 * @private
 */
const mapOrgUnitCodeToUniqueOrgUnitName = (allOrgUnits, eventsByOrgUnitCode) => {
  const orgUnitsByCode = {};

  for (const orgUnitCode of Object.keys(eventsByOrgUnitCode)) {
    orgUnitsByCode[orgUnitCode] = allOrgUnits.find(orgUnit => orgUnit.code === orgUnitCode);
  }

  const eventsByUniqueOrgUnitName = {};

  for (const orgUnitCode of Object.keys(eventsByOrgUnitCode)) {
    const orgUnit = orgUnitsByCode[orgUnitCode];

    const isNameUnique =
      Object.values(orgUnitsByCode)
        .filter(otherOrgUnit => otherOrgUnit.code !== orgUnitCode)
        .filter(otherOrgUnit => otherOrgUnit.name === orgUnit.name).length === 0;

    if (isNameUnique) {
      eventsByUniqueOrgUnitName[orgUnit.name] = eventsByOrgUnitCode[orgUnitCode];
    } else {
      const uniqueName = `${orgUnit.name} (${orgUnitCode})`;
      eventsByUniqueOrgUnitName[uniqueName] = eventsByOrgUnitCode[orgUnitCode];
    }
  }

  return eventsByUniqueOrgUnitName;
};

const groupByAllOrgUnitNames = async (models, events, options, hierarchyId) => {
  const orgUnits = await getOrgUnits(models, { ...options, hierarchyId });

  const eventsByOrgUnitCode = orgUnits.reduce((results, { code }) => {
    results[code] = [];
    return results;
  }, {});

  events.forEach(event => {
    const { orgUnit: orgUnitCode } = event;
    if (eventsByOrgUnitCode[orgUnitCode]) {
      eventsByOrgUnitCode[orgUnitCode].push(event);
    }
  });

  return mapOrgUnitCodeToUniqueOrgUnitName(orgUnits, eventsByOrgUnitCode);
};

const groupByAllOrgUnitParentNames = async (models, events, options, hierarchyId) => {
  const { aggregationLevel } = options;
  const orgUnits = await getOrgUnits(models, { ...options, hierarchyId });

  const eventsByOrgUnitCode = orgUnits.reduce((results, { code }) => {
    results[code] = [];
    return results;
  }, {});

  const allOrgUnitCodesByParentOrgUnitCode = {};
  /* format:
   * {
   *  "village1": "facility1",
   *  "village2": "facility2",
   *  "village3": "facility1"
   * }
   */
  await Promise.all(
    orgUnits.map(async parentOrgUnit => {
      const { code } = parentOrgUnit;
      const childrenAndSelf = await parentOrgUnit.getDescendantsOfType(
        hierarchyId,
        aggregationLevel,
      );
      childrenAndSelf.forEach(orgUnit => {
        allOrgUnitCodesByParentOrgUnitCode[orgUnit.code] = code;
      });
    }),
  );

  events.forEach(event => {
    const { orgUnit: orgUnitCode } = event;
    if (allOrgUnitCodesByParentOrgUnitCode[orgUnitCode]) {
      eventsByOrgUnitCode[allOrgUnitCodesByParentOrgUnitCode[orgUnitCode]].push(event);
    }
  });

  return mapOrgUnitCodeToUniqueOrgUnitName(orgUnits, eventsByOrgUnitCode);
};

const groupByDataValues = (_, events, options) => {
  const groupedEvents = {};
  for (const groupingName of Object.keys(options)) {
    groupedEvents[groupingName] = getEventsThatSatisfyConditions(events, options[groupingName]);
  }
  return groupedEvents;
};

const GROUP_BY_VALUE_TO_METHOD = {
  allOrgUnitNames: groupByAllOrgUnitNames,
  allOrgUnitParentNames: groupByAllOrgUnitParentNames,
  nothing: (_, events) => {
    return { all: events };
  }, // used for testing
  dataValues: groupByDataValues,
};

/**
 * @param {array} events
 * @param {object} groupBySpecs
 * @returns {Promise<object>} object of groupName => eventsForGroup
 */
export const groupEvents = async (models, events, groupBySpecs = {}) => {
  const { type, options, hierarchyId } = groupBySpecs;
  const groupByMethod = GROUP_BY_VALUE_TO_METHOD[type];
  if (!groupByMethod) {
    throw new Error(`'${type}' is not a supported groupBy type`);
  }

  return groupByMethod(models, events, options, hierarchyId);
};

/**
 * @param {object} groupBySpecs
 * @returns {array<string>} data element codes used in this grouping config
 */
export const getAllDataElementCodes = groupBySpecs => {
  if (groupBySpecs.type === 'dataValues') {
    let allDataElementCodes = [];
    Object.values(groupBySpecs.options).forEach(grouping => {
      allDataElementCodes = [...allDataElementCodes, ...Object.keys(grouping.dataValues)];
    });
    return allDataElementCodes;
  }
  return [];
};
