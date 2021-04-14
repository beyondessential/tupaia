/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';

import { testCategories } from './testCategories';
import { testNoCategories } from './testNoCategories';
import { testOrgUnitCategories } from './testOrgUnitCategories';
import { testTotals } from './testTotals';
import { testOptions } from './testOptions';
import * as CheckAllDataElementsAreDhisIndicators from '/apiV1/utils/fetchIndicatorValues/checkAllDataElementsAreDhisIndicators';

describe('tableOfDataValues', () => {
  before(async () => {
    // TODO: checkAllDataElementsAreDhisIndicators is for implement a hacky approach to fetch indicator values
    // because the normal analytics/rawData.json endpoint does not return any data for indicators.
    // We do not need to test this function
    // Will have to implement this properly with #tupaia-backlog/issues/2412
    // After that remove this stub
    sinon
      .stub(CheckAllDataElementsAreDhisIndicators, 'checkAllDataElementsAreDhisIndicators')
      .resolves(false);
  });

  describe('no categories', testNoCategories);

  describe('categories', testCategories);

  describe('org unit categories', testOrgUnitCategories);

  describe('totals', testTotals);

  describe('options', testOptions);
});
