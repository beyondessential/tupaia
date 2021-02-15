/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Builder } from './Builder';

export const getElementCodesForBuilders = (builders: Builder[]) =>
  builders.map(b => b.getElementCodes()).flat();

export const getAggregationListMapsByBuilder = (builders: Builder[]) =>
  Object.fromEntries(
    builders.map(builder => [builder.getIndicator().code, builder.getAggregationListsMap()]),
  );
