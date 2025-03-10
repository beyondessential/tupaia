/**
 * Utility that asserts that a DHIS dimension string contains members independently of their order
 * For example, `ou:ouCode1;ouCode2` is equivalent to `ou:ouCode2;ouCode1`
 */
export const assertDhisDimensionHasMembers = (dimensionString, targetMembers) => {
  const [, membersString = ''] = dimensionString.split(':');
  const foundMembers = membersString.split(';');
  /**
   * Note: Due to incompatibility with jest-expected-message and jest 27+ we are disabling
   * the custom error messages for these tests. Will re-instate once the fix gets merged:
   *  https://github.com/mattphillips/jest-expect-message/pull/40
   */
  // expect(foundMembers, 'Dimension string does not include the target members').toIncludeAllMembers(
  //   targetMembers,
  // );
  expect(foundMembers).toIncludeAllMembers(targetMembers);
};
