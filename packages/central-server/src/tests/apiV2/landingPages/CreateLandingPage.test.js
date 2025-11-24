import { findOrCreateDummyRecord } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';
import * as UploadImage from '../../../apiV2/utilities/uploadImage';

describe('Creating a landing page', async () => {
  let uploadImageStub;
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const EXAMPLE_UPLOADED_IMAGE_URL = 'https://example.com/image.jpg';
  const TEST_PROJECT_CODE = 'explore';

  const ENCODED_IMAGE =
    'data:image/gif;base64,R0lGODdh4AHwANUAAKqqqgAAAO7u7ru7u+Xl5czMzN3d3cPDw7KystTU1H9/fxcXF1VVVXJych0dHRkZGS4uLo+Pjzc3N5SUlMHBwSwsLGpqahUVFSoqKklJScjIyBgYGLm5uTk5OW9vbzAwMKurqxYWFqWlpaOjoxwcHEJCQp+fn3d3d0ZGRhoaGpubm4WFhV1dXVlZWT8/P4qKimFhYTMzM25ubtDQ0ExMTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAA4AHwAAAG/kCAcEgsGo/IpHLJbDqf0Kh0Sq1ar9isdsvter/gsHhMLpvP6LR6zW673/C4fE6v2+/4vH7P7/v/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAwocSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOn/s+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsyYmIIAQyxcCIBBAREFky9YmKIAQ4AADJA8HoI5gObGlhZABmAhgwYBFCBsBjBhAQgBIAJYjoJCxowZNGYXUS2k9u3cu1FHYtDAgZANHBAAQEBhg5ASDQYAGHAChZQEBRAgSGC9CHPnALBr5+5dOSQFDwqs7uBhiIcOQlJIF4IghREXySngQhITkFAEfPLlt990/rn3CAQRALBadQxMwMAHFAgRwIIq/qxGRAIQTEAbBAkk4UFoREAooYYceujgIgxIcMCK04HwQAgBiLCfiwi4OIQIFUxQQYZJQEdEjDOuxqOPLx4ywQNErqbAAhoQUNtsAYg4BJPbvRDACwsawQADCz4ZpYZaatjkIhV85uZntkl3AAjlObDCEBOgZwQMLWSQBHwcENHmm5/Ziaeeax5igACMChAAowGMMMQIBgLAAAtDtIDigTEkYEFyRBgX5qKNPirApZlumugiqwkp4gQlgCCECboBAKgRtWVYQIhGVBCBdkmsRqtlt67KyGoHiIBjCCYAO0BtAcRpRAkR7CdCCUV49iYSqz2rmrTGLiLAEAMQIAABwMAKcYC56B6RwIxCDFAiEaQ2isS46rKbbrj89uvvvwAHLPDABBds8MEIJ6zwwgw37PDDEEcs8cQUV2zxxRhnrPHGHHfs8ccghyzyyCSXbPLJKKes8sost+zyyzDHLPPMNNds880456zzzjz37PPPQAct9NBEF2300UgnrfTSTDft9NNQRy311FRXbfXVWGet9dZcd+3112CHLfbYZJdt9tlop6322my37fbbcMct99x012333XjnrffefPft98pBAAA7';

  const TEST_LANDING_PAGE_INPUT = {
    name: 'test_name',
    project_codes: [TEST_PROJECT_CODE],
    url_segment: 'test_url_segment',
    image_url: EXAMPLE_UPLOADED_IMAGE_URL,
    logo_url: EXAMPLE_UPLOADED_IMAGE_URL,
    primary_hexcode: '#000000',
    secondary_hexcode: '#ffffff',
    extended_title: 'test_extended_title',
    long_bio: 'test_long_bio',
    external_link: 'www.example.com',
    website_url: 'www.example.com',
    phone_numer: '12345678',
    include_name_in_header: false,
  };

  const app = new TestableApp();
  const { models } = app;

  before(() => {
    uploadImageStub = sinon.stub(UploadImage, 'uploadImage').resolves(EXAMPLE_UPLOADED_IMAGE_URL);
  });

  beforeEach(async () => {
    await findOrCreateDummyRecord(models.project, { code: TEST_PROJECT_CODE });
  });

  afterEach(async () => {
    await models.landingPage.delete({ url_segment: TEST_LANDING_PAGE_INPUT.url_segment });
    await models.project.delete({ code: TEST_PROJECT_CODE });
    app.revokeAccess();
  });

  after(async () => {
    uploadImageStub.restore();
  });

  describe('POST /landingPages', async () => {
    describe('Record creation', async () => {
      it('creates a valid landing page record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('landingPages', {
          body: {
            ...TEST_LANDING_PAGE_INPUT,
          },
        });

        const result = await models.landingPage.find({
          url_segment: TEST_LANDING_PAGE_INPUT.url_segment,
        });
        expect(result.length).to.equal(1);
        expect(result[0].url_segment).to.equal(TEST_LANDING_PAGE_INPUT.url_segment);
      });

      it('uploads the value of image_url', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('landingPages', {
          body: {
            ...TEST_LANDING_PAGE_INPUT,
            image_url: ENCODED_IMAGE,
          },
        });

        const result = await models.landingPage.find({
          url_segment: TEST_LANDING_PAGE_INPUT.url_segment,
        });
        expect(result.length).to.equal(1);
        expect(result[0].image_url).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
      });

      it('uploads the value of logo_url', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('landingPages', {
          body: {
            ...TEST_LANDING_PAGE_INPUT,
            logo_url: ENCODED_IMAGE,
          },
        });

        const result = await models.landingPage.find({
          url_segment: TEST_LANDING_PAGE_INPUT.url_segment,
        });
        expect(result.length).to.equal(1);
        expect(result[0].logo_url).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
      });
    });
  });
});
