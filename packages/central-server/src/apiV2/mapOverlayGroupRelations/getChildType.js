/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const getChildType = async (models, childId) => {
  const matchedOverlay = await models.mapOverlay.findOne({ id: childId });
  const matchedGroup = await models.mapOverlayGroup.findOne({ id: childId });
  if (matchedOverlay) {
    return 'mapOverlay';
  }

  if (matchedGroup) {
    return 'mapOverlayGroup';
  }

  throw new Error(
    'The Child Code chosen does not correspond to a matching Map Overlay or Map Overlay Group.',
  );
};
