/**
 *
 * @param {string} dataElementServiceType
 * @returns {boolean}
 *
 * @description This is a utility function to check whether the data element can have a different service type to the data group it is in. Tupaia data elements can have dhis or Tupaia data groups. While the logic here is simple, keeping it in one place will reduce the likelihood of bugs.
 */
export const dataElementMustMatchDataGroupServiceType = dataElementServiceType => {
  if (dataElementServiceType === 'tupaia') return false;
  return true;
};
