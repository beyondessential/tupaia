/**  Generates a standardised image name based on the uniqueId and imageSuffix. For example for a project, uniqueId would be the project code and imageSuffix would be either 'project_image' or 'project_logo' */
export const getStandardisedImageName = (uniqueId, imageSuffix, useTimestamp) =>
  `${uniqueId}_${imageSuffix}${useTimestamp ? `_${Date.now()}` : ''}`;
