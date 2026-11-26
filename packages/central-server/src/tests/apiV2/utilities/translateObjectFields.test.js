import chai from 'chai';

import { translateObjectFields } from '../../../apiV2/utilities/translateObjectFields';

const { expect } = chai;

describe('translateObjectFields', () => {
  const translators = {
    survey_code: async surveyCode => ({ survey_id: `id_of_${surveyCode}` }),
  };

  it('replaces a field that has a translator with the translated fields', async () => {
    const object = { survey_code: 'TEST_SURVEY', untouched: 1 };
    await translateObjectFields(object, translators);
    expect(object).to.deep.equal({ survey_id: 'id_of_TEST_SURVEY', untouched: 1 });
  });

  // Field names come from user-supplied payloads, so they must never resolve to members inherited
  // from Object.prototype
  for (const field of ['constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
    it(`passes a "${field}" field through untranslated`, async () => {
      const object = { [field]: { a: 1 }, survey_code: 'TEST_SURVEY' };
      await translateObjectFields(object, translators);
      expect(Object.hasOwn(object, field)).to.equal(true);
      expect(object[field]).to.deep.equal({ a: 1 });
      expect(object.survey_id).to.equal('id_of_TEST_SURVEY');
    });
  }

  it('passes an own "__proto__" field through untranslated', async () => {
    // JSON.parse creates `__proto__` as an own property, as a request body would
    const object = JSON.parse('{ "__proto__": { "a": 1 }, "survey_code": "TEST_SURVEY" }');
    await translateObjectFields(object, translators);
    expect(Object.hasOwn(object, '__proto__')).to.equal(true);
    expect(Object.getOwnPropertyDescriptor(object, '__proto__').value).to.deep.equal({ a: 1 });
    expect(object.survey_id).to.equal('id_of_TEST_SURVEY');
  });

  it('ignores own translator entries that are not functions', async () => {
    const object = { survey_code: 'TEST_SURVEY' };
    await translateObjectFields(object, { survey_code: 'not a function' });
    expect(object).to.deep.equal({ survey_code: 'TEST_SURVEY' });
  });
});
