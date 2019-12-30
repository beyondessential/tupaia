/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import {
  isMetadataKey,
  metadataKeysToDataElementMap,
  METADATA_KEYS,
} from '/apiV1/dataBuilders/helpers/eventMetadata';
import { testAddMetadataToEvents } from './testAddMetadataToEvents';

describe('eventMetadata', () => {
  describe('isMetadataKey()', () => {
    it('should identify a metadata key', () => {
      Object.keys(METADATA_KEYS).forEach(key => expect(isMetadataKey(key)).to.be.true);
    });

    it('should identify a non metadata key', () => {
      ['wrongKey', 'CD1', 'eventOrgUnitName'].forEach(
        key => expect(isMetadataKey(key)).to.be.false,
      );
    });
  });

  describe('metadataKeysToDataElementMap()', () => {
    it('should return an empty object for empty input', () => {
      expect(metadataKeysToDataElementMap()).to.deep.equal({});
      expect(metadataKeysToDataElementMap([])).to.deep.equal({});
    });

    it('should throw an error if an invalid key has been provided', () => {
      const assertErrorIsThrownForKeys = keys =>
        expect(() => metadataKeysToDataElementMap(keys)).to.throw('Invalid metadata key');

      assertErrorIsThrownForKeys(['invalidKey']);
      assertErrorIsThrownForKeys(['$eventOrgUnitName', 'invalidKey']);
    });

    it('should create a map out of valid metadata keys', () => {
      expect(metadataKeysToDataElementMap(['$eventOrgUnitName'])).to.deep.equal({
        $eventOrgUnitName: {
          name: 'Location',
          id: '$eventOrgUnitName',
          code: '$eventOrgUnitName',
        },
      });
    });
  });

  describe('addMetadataToEvents()', () => {
    testAddMetadataToEvents();
  });
});
