/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { LegendProps } from '@tupaia/ui-map-components';
import { MobileMapLegend } from './MobileMapLegend';
import { DesktopMapLegend } from './DesktopMapLegend';

export const MapLegend = ({
  hiddenValues,
  setHiddenValue,
}: {
  hiddenValues: LegendProps['hiddenValues'];
  setHiddenValue: Function;
}) => {
  return (
    <>
      <MobileMapLegend />
      <DesktopMapLegend hiddenValues={hiddenValues} setHiddenValue={setHiddenValue} />
    </>
  );
};
