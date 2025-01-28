export const formatInboundDataElementName = (
  dataElementName: string,
  categoryOptionComboName?: string,
) => {
  return dataElementName + (categoryOptionComboName ? ` - ${categoryOptionComboName}` : '');
};
