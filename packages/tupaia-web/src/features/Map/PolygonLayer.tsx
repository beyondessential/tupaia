/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { InteractivePolygon } from './InteractivePolygon';

const VisibleChildEntities = () => {
  return null;
};

const SiblingEntities = () => {
  return null;
};

export const PolygonLayer = ({ entity }) => {
  if (!entity?.region) {
    return null;
  }

  return (
    <>
      {/*<ActiveEntityPolygon entity={entity} />*/}
      <InteractivePolygon entity={entity} isActive />
      <VisibleChildEntities />
      <SiblingEntities />
    </>
  );
};
