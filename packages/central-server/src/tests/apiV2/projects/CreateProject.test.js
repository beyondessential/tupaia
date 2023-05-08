/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId, findOrCreateDummyRecord } from '@tupaia/database';
import AWS from 'aws-sdk';
import { S3Client } from '@tupaia/utils';
import { expect } from 'chai';
import sinon from 'sinon';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';
import { TestableApp } from '../../testUtilities';

const rollbackRecords = async (models, projectCode) => {
  await models.project.delete({ code: projectCode });
  await models.dashboard.delete({ root_entity_code: projectCode });
  const projectEntity = await models.entity.findOne({ code: projectCode, type: 'project' });
  if (projectEntity !== null) {
    await models.entityRelation.delete({ parent_id: projectEntity.id });
    await models.entity.delete({ id: projectEntity.id });
  }
  await models.entityHierarchy.delete({ name: projectCode });
};

describe('Creating a project', async () => {
  let s3ClientStub;
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const EXAMPLE_UPLOADED_IMAGE_URL = 'https://example.com/image.jpg';

  const TEST_COUNTRY_ID = generateId();
  const TEST_MAP_OVERLAY_ID = generateId();

  const TEST_PROJECT_INPUT = {
    code: 'test_project_new',
    name: 'test_name',
    countries: [TEST_COUNTRY_ID],
    permission_groups: ['test_group1'],
    description: 'This is a test description',
    sort_order: 3,
    image_url: 'www.image.com',
    logo_url: 'www.image.com',
    entityTypes: ['country'],
    dashboard_group_name: 'test_dashboard',
    default_measure: TEST_MAP_OVERLAY_ID,
  };
  const ENCODED_IMAGE =
    'data:image/gif;base64,R0lGODdh4AHwANUAAKqqqgAAAO7u7ru7u+Xl5czMzN3d3cPDw7KystTU1H9/fxcXF1VVVXJych0dHRkZGS4uLo+Pjzc3N5SUlMHBwSwsLGpqahUVFSoqKklJScjIyBgYGLm5uTk5OW9vbzAwMKurqxYWFqWlpaOjoxwcHEJCQp+fn3d3d0ZGRhoaGpubm4WFhV1dXVlZWT8/P4qKimFhYTMzM25ubtDQ0ExMTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAA4AHwAAAG/kCAcEgsGo/IpHLJbDqf0Kh0Sq1ar9isdsvter/gsHhMLpvP6LR6zW673/C4fE6v2+/4vH7P7/v/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAwocSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOn/s+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsyYmIIAQyxcCIBBAREFky9YmKIAQ4AADJA8HoI5gObGlhZABmAhgwYBFCBsBjBhAQgBIAJYjoJCxowZNGYXUS2k9u3cu1FHYtDAgZANHBAAQEBhg5ASDQYAGHAChZQEBRAgSGC9CHPnALBr5+5dOSQFDwqs7uBhiIcOQlJIF4IghREXySngQhITkFAEfPLlt990/rn3CAQRALBadQxMwMAHFAgRwIIq/qxGRAIQTEAbBAkk4UFoREAooYYceujgIgxIcMCK04HwQAgBiLCfiwi4OIQIFUxQQYZJQEdEjDOuxqOPLx4ywQNErqbAAhoQUNtsAYg4BJPbvRDACwsawQADCz4ZpYZaatjkIhV85uZntkl3AAjlObDCEBOgZwQMLWSQBHwcENHmm5/Ziaeeax5igACMChAAowGMMMQIBgLAAAtDtIDigTEkYEFyRBgX5qKNPirApZlumugiqwkp4gQlgCCECboBAKgRtWVYQIhGVBCBdkmsRqtlt67KyGoHiIBjCCYAO0BtAcRpRAkR7CdCCUV49iYSqz2rmrTGLiLAEAMQIAABwMAKcYC56B6RwIxCDFAiEaQ2isS46rKbbrj89uvvvwAHLPDABBds8MEIJ6zwwgw37PDDEEcs8cQUV2zxxRhnrPHGHHfs8ccghyzyyCSXbPLJKKes8sost+zyyzDHLPPMNNds880456zzzjz37PPPQAct9NBEF2300UgnrfTSTDft9NNQRy311FRXbfXVWGet9dZcd+3112CHLfbYZJdt9tlop6322my37fbbcMct99x012333XjnrffefPft98pBAAA7';

  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await models.country.delete({ code: 'DL' });
    await models.mapOverlay.delete({ code: '126' });
    await findOrCreateDummyRecord(models.entity, { code: 'World' });
    await findOrCreateDummyRecord(models.country, { id: TEST_COUNTRY_ID, code: 'DL' });
    await findOrCreateDummyRecord(models.entity, { code: 'DL' });
    await findOrCreateDummyRecord(models.entity, { code: 'test_project' });
    await findOrCreateDummyRecord(models.project, { code: 'test_project' });
    await findOrCreateDummyRecord(models.permissionGroup, { name: 'test_group1' });
    await findOrCreateDummyRecord(models.mapOverlay, { id: TEST_MAP_OVERLAY_ID, code: '126' });
    sinon.createStubInstance(AWS.S3);
  });
  beforeEach(() => {
    s3ClientStub = sinon
      .stub(S3Client.prototype, 'uploadImage')
      .returns(Promise.resolve(EXAMPLE_UPLOADED_IMAGE_URL));
  });

  afterEach(async () => {
    await rollbackRecords(models, 'test_project_new');
    app.revokeAccess();
    s3ClientStub.restore();
  });

  describe('POST /projects', async () => {
    describe('New record validation', async () => {
      it('Throws an error when the project code already exists', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const code = 'test_project';

        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            code,
          },
        });

        expect(result).to.deep.equal({
          error: `Invalid content for field "code" causing message "Another project record already exists with with code: ${code}"`,
        });
      });

      it('Throws an error when a non-existent country is included', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const OTHER_COUNTRY_ID = generateId();

        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            countries: [OTHER_COUNTRY_ID],
          },
        });

        expect(result).to.deep.equal({
          error:
            'Invalid content for field "countries" causing message "One or more provided countries do not exist"',
        });
      });

      it('Throws an error when there is a non-existent permission group included', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            permission_groups: ['test_group1', 'test_group2'],
          },
        });

        expect(result).to.deep.equal({
          error:
            'Invalid content for field "permission_groups" causing message "Some provided permission groups do not exist"',
        });
      });

      it('Throws an error when the entity types include a non-existent type', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            entityTypes: ['country', 'office'],
          },
        });

        expect(result).to.deep.equal({
          error:
            'Invalid content for field "entityTypes" causing message "Some provided entity types do not exist"',
        });
      });
    });

    describe('Record creation', async () => {
      it('creates a valid project record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
          },
        });

        const result = await models.project.find({ code: TEST_PROJECT_INPUT.code });
        expect(result.length).to.equal(1);
        expect(result[0].description).to.equal(TEST_PROJECT_INPUT.description);
      });

      it('creates a valid entity record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
          },
        });

        const result = await models.entity.find({ name: TEST_PROJECT_INPUT.name, type: 'project' });
        expect(result.length).to.equal(1);
        expect(result[0].code).to.equal(TEST_PROJECT_INPUT.code);
      });

      it('creates a valid entity hierarchy record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
          },
        });

        const result = await models.entityHierarchy.find({ name: TEST_PROJECT_INPUT.code });
        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(TEST_PROJECT_INPUT.code);
      });
    });

    it('uploads the value of image_url if is a base64 encoded image', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      await app.post('projects', {
        body: {
          ...TEST_PROJECT_INPUT,
          image_url: ENCODED_IMAGE,
        },
      });

      const result = await models.project.find({ code: TEST_PROJECT_INPUT.code });
      expect(result.length).to.equal(1);
      expect(result[0].image_url).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
    });

    it('uploads the value of logo_url if is a base64 encoded image', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      await app.post('projects', {
        body: {
          ...TEST_PROJECT_INPUT,
          logo_url: ENCODED_IMAGE,
        },
      });

      const result = await models.project.find({ code: TEST_PROJECT_INPUT.code });
      expect(result.length).to.equal(1);
      expect(result[0].logo_url).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
    });
  });
});
