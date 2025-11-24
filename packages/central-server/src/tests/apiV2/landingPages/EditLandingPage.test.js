import { generateId, findOrCreateDummyRecord } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';
import * as UploadImage from '../../../apiV2/utilities/uploadImage';
import { setupProject } from './utils';

describe('Editing a landing page', async () => {
  let uploadImageStub;
  const EXAMPLE_UPLOADED_IMAGE_URL = 'https://example.com/image.jpg';

  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Public'],
  };
  const URL_SEGMENT = 'theUrlSegment';

  const TEST_LANDING_PAGE_INPUT = {
    id: generateId(),
    image_url: 'www.image.com',
    logo_url: 'www.image.com',
    extended_title: 'old extended title',
  };
  const ENCODED_IMAGE =
    'data:image/gif;base64,R0lGODdh4AHwANUAAKqqqgAAAO7u7ru7u+Xl5czMzN3d3cPDw7KystTU1H9/fxcXF1VVVXJych0dHRkZGS4uLo+Pjzc3N5SUlMHBwSwsLGpqahUVFSoqKklJScjIyBgYGLm5uTk5OW9vbzAwMKurqxYWFqWlpaOjoxwcHEJCQp+fn3d3d0ZGRhoaGpubm4WFhV1dXVlZWT8/P4qKimFhYTMzM25ubtDQ0ExMTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAA4AHwAAAG/kCAcEgsGo/IpHLJbDqf0Kh0Sq1ar9isdsvter/gsHhMLpvP6LR6zW673/C4fE6v2+/4vH7P7/v/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAwocSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOn/s+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsyYmIIAQyxcCIBBAREFky9YmKIAQ4AADJA8HoI5gObGlhZABmAhgwYBFCBsBjBhAQgBIAJYjoJCxowZNGYXUS2k9u3cu1FHYtDAgZANHBAAQEBhg5ASDQYAGHAChZQEBRAgSGC9CHPnALBr5+5dOSQFDwqs7uBhiIcOQlJIF4IghREXySngQhITkFAEfPLlt990/rn3CAQRALBadQxMwMAHFAgRwIIq/qxGRAIQTEAbBAkk4UFoREAooYYceujgIgxIcMCK04HwQAgBiLCfiwi4OIQIFUxQQYZJQEdEjDOuxqOPLx4ywQNErqbAAhoQUNtsAYg4BJPbvRDACwsawQADCz4ZpYZaatjkIhV85uZntkl3AAjlObDCEBOgZwQMLWSQBHwcENHmm5/Ziaeeax5igACMChAAowGMMMQIBgLAAAtDtIDigTEkYEFyRBgX5qKNPirApZlumugiqwkp4gQlgCCECboBAKgRtWVYQIhGVBCBdkmsRqtlt67KyGoHiIBjCCYAO0BtAcRpRAkR7CdCCUV49iYSqz2rmrTGLiLAEAMQIAABwMAKcYC56B6RwIxCDFAiEaQ2isS46rKbbrj89uvvvwAHLPDABBds8MEIJ6zwwgw37PDDEEcs8cQUV2zxxRhnrPHGHHfs8ccghyzyyCSXbPLJKKes8sost+zyyzDHLPPMNNds880456zzzjz37PPPQAct9NBEF2300UgnrfTSTDft9NNQRy311FRXbfXVWGet9dZcd+3112CHLfbYZJdt9tlop6322my37fbbcMct99x012333XjnrffefPft98pBAAA7';

  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    uploadImageStub = sinon.stub(UploadImage, 'uploadImage').resolves(EXAMPLE_UPLOADED_IMAGE_URL);
    await setupProject(models);
  });
  beforeEach(async () => {
    await findOrCreateDummyRecord(models.landingPage, {
      ...TEST_LANDING_PAGE_INPUT,
      url_segment: URL_SEGMENT,
      project_codes: '{test_project1}',
    });
  });

  afterEach(async () => {
    await models.landingPage.delete({ id: TEST_LANDING_PAGE_INPUT.id });
    app.revokeAccess();
  });

  after(async () => {
    uploadImageStub.restore();
    await resetTestData();
  });

  describe('PUT /landingPages', async () => {
    it('updates a landingPage record', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          extended_title: 'the updated extended title',
        },
      });

      const result = await models.landingPage.find({
        id: TEST_LANDING_PAGE_INPUT.id,
      });
      expect(result.length).to.equal(1);
      expect(result[0].extended_title).to.equal('the updated extended title');
    });

    it('uploads the value of image_url if it has changed', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          image_url: ENCODED_IMAGE,
        },
      });

      const result = await models.landingPage.find({
        id: TEST_LANDING_PAGE_INPUT.id,
      });

      expect(result.length).to.equal(1);
      expect(result[0].image_url).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
    });

    it('uploads the value of logo_url if it has changed', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          logo_url: ENCODED_IMAGE,
        },
      });

      const result = await models.landingPage.find({
        id: TEST_LANDING_PAGE_INPUT.id,
      });

      expect(result.length).to.equal(1);
      expect(result[0].logo_url).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
    });

    it('does not upload a new image_url or logo_url if these have not changed', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          image_url: undefined,
          logo_url: undefined,
        },
      });

      const result = await models.landingPage.find({
        id: TEST_LANDING_PAGE_INPUT.id,
      });

      expect(result.length).to.equal(1);
      expect(result[0].image_url).to.equal(TEST_LANDING_PAGE_INPUT.image_url);
      expect(result[0].logo_url).to.equal(TEST_LANDING_PAGE_INPUT.logo_url);
    });
  });

  describe('Permissions checker', async () => {
    it('Successfully updates a landingPage record if the user has access to the admin panel and a project on the landing page', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);

      const result = await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          extended_title: 'the updated extended title',
        },
      });

      expect(result.status).to.equal(200);
    });

    it('Throws an error if the user has admin permission but no access to any projects in the landing page', async () => {
      await app.grantAccess({
        TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      });

      const result = await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          extended_title: 'the updated extended title',
        },
      });
      expect(result.text).to.equal(
        '{"error":"One of the following conditions need to be satisfied:\\nNeed BES Admin access\\nNeed access to a project that the landing page belongs to."}',
      );
    });

    it('Throws an error if the user has permission for the project but not admin panel permissions', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });

      const result = await app.put(`landingPages/${TEST_LANDING_PAGE_INPUT.id}`, {
        body: {
          ...TEST_LANDING_PAGE_INPUT,
          extended_title: 'the updated extended title',
        },
      });
      expect(result.text).to.equal(
        '{"error":"One of the following conditions need to be satisfied:\\nNeed BES Admin access\\nNeed Tupaia Admin Panel access"}',
      );
    });
  });
});
