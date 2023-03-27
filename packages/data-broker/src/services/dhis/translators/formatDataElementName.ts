/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const formatInboundDataElementName = (
  dataElementName: string,
  categoryOptionComboName?: string,
) => {
  return dataElementName + (categoryOptionComboName ? ` - ${categoryOptionComboName}` : '');
};
