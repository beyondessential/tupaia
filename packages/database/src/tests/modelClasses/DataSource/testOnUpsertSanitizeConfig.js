/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { onUpsertSanitizeConfig } from '../../../modelClasses/DataSource';
import { getDataSources } from './DataSource.fixtures';

export const testOnUpsertSanitizeConfig = () => {
  let dataSources;

  const resetDataSources = () => {
    dataSources = getDataSources();
    Object.values(dataSources).forEach(dataSource => {
      // eslint-disable-next-line no-param-reassign
      dataSource.save = sinon.stub();
    });
  };

  const models = {
    dataSource: {
      findById: sinon.stub().callsFake(id => dataSources[id] || null),
    },
  };

  const assertDataSourceConfigIsCorrectAfterChagne = async (change, expectedConfig) => {
    const { id, type: changeType, config: changedConfig } = change;
    const dataSource = dataSources[id];
    dataSource.config = changedConfig;

    await onUpsertSanitizeConfig(
      {
        type: changeType,
        record: { ...dataSource, config: changedConfig },
        record_id: id,
      },
      models,
    );
    expect(dataSource).to.have.deep.property('config', expectedConfig);
  };

  beforeEach(() => {
    resetDataSources();
  });

  describe('on update', () => {
    describe.only('dhis service', () => {
      it('data element', async () =>
        assertDataSourceConfigIsCorrectAfterChagne(
          {
            id: 'dataElement_dhis',
            type: 'update',
            config: {
              categoryOptionCombo: 'newCombo',
              dataElementCode: 'newCode',
              isDataRegional: false,
              other: 'random',
            },
          },
          {
            categoryOptionCombo: 'newCombo',
            dataElementCode: 'newCode',
            isDataRegional: false,
          },
        ));

      it('data group', async () =>
        assertDataSourceConfigIsCorrectAfterChagne(
          {
            id: 'dataGroup_dhis',
            type: 'update',
            config: { dataElementCode: 'newCode', isDataRegional: false, other: 'random' },
          },
          { isDataRegional: false },
        ));
    });

    describe('tupaia service', () => {
      it('data element', async () =>
        assertDataSourceConfigIsCorrectAfterChagne(
          {
            id: 'dataElement_tupaia',
            type: 'update',
            config: { isDataRegional: false, other: 'random' },
          },
          {},
        ));

      it('data group', async () =>
        assertDataSourceConfigIsCorrectAfterChagne(
          {
            id: 'dataGroup_tupaia',
            type: 'update',
            config: { isDataRegional: false, other: 'random' },
          },
          {},
        ));
    });

    it('unknown service', () => {
      const dataSource = dataSources.dataElement_other;

      return expect(
        onUpsertSanitizeConfig(
          {
            type: 'update',
            record: dataSource,
            record_id: dataSource.id,
          },
          models,
        ),
      ).to.be.rejectedWith(/config keys .*service/);
    });
  });

  describe('on delete', () => {
    it('should do nothing', async () => {
      const dataSource = dataSources.dataElement_other;
      delete dataSources.dataElement_other;

      await onUpsertSanitizeConfig(
        {
          type: 'delete',
          record: dataSource,
          record_id: dataSource.id,
        },
        models,
      );
      expect(dataSource.save).to.have.callCount(0);
    });
  });
};
