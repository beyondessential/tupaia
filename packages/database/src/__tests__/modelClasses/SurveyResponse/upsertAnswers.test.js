import {
  batchByTextLength,
  MAX_BATCH_TEXT_LENGTH,
  upsertAnswers,
} from '../../../core/modelClasses/SurveyResponse/upsertAnswers';

const doc = length => ({ text: 'x'.repeat(length) });

describe('batchByTextLength', () => {
  it('returns no chunks for no documents', () => {
    expect(batchByTextLength([], 10)).toEqual([]);
  });

  it('keeps small documents together', () => {
    const documents = [doc(2), doc(3), doc(5)];
    expect(batchByTextLength(documents, 10)).toEqual([documents]);
  });

  it('starts a new chunk when the next document would exceed the limit', () => {
    const [a, b, c] = [doc(6), doc(6), doc(3)];
    expect(batchByTextLength([a, b, c], 10)).toEqual([[a], [b, c]]);
  });

  it('gives an oversized document a chunk to itself', () => {
    const [a, big, c] = [doc(1), doc(50), doc(1)];
    expect(batchByTextLength([a, big, c], 10)).toEqual([[a], [big], [c]]);
  });

  it('treats missing text as zero length', () => {
    const documents = [{ text: null }, {}, doc(10)];
    expect(batchByTextLength(documents, 10)).toEqual([documents]);
  });
});

describe('upsertAnswers', () => {
  const surveyResponseId = 'response_id';
  const createMany = jest.fn(async records => records);
  const models = { answer: { createMany } };

  beforeEach(() => createMany.mockClear());

  it('saves ordinary answers in one statement', async () => {
    const answers = ['q1', 'q2', 'q3'].map(question_id => ({
      question_id,
      type: 'FreeText',
      body: 'hello',
    }));
    await upsertAnswers(models, answers, surveyResponseId);
    expect(createMany).toHaveBeenCalledTimes(1);
    expect(createMany.mock.calls[0][0]).toHaveLength(3);
  });

  it('splits large answers across statements so no single statement is huge', async () => {
    const photo = `data:image/jpeg;base64,${'A'.repeat(6 * 1024 * 1024)}`;
    const answers = Array.from({ length: 15 }, (_, i) => ({
      question_id: `q${i}`,
      type: 'Photo', // offline, an inline base64 photo is saved as-is
      body: photo,
    }));

    const records = await upsertAnswers(models, answers, surveyResponseId);

    expect(records).toHaveLength(15);
    expect(createMany.mock.calls.length).toBeGreaterThan(1);
    for (const [chunk] of createMany.mock.calls) {
      const totalLength = chunk.reduce((sum, { text }) => sum + text.length, 0);
      // Only a lone answer may go over the limit
      if (chunk.length > 1) expect(totalLength).toBeLessThanOrEqual(MAX_BATCH_TEXT_LENGTH);
    }
  });

  it('keeps explicit and generated ids in separate statements with the right merge columns', async () => {
    const answers = [
      { id: 'explicit_id', question_id: 'q1', type: 'FreeText', body: 'a' },
      { question_id: 'q2', type: 'FreeText', body: 'b' },
    ];
    await upsertAnswers(models, answers, surveyResponseId);

    expect(createMany).toHaveBeenCalledTimes(2);
    const [[explicitChunk, explicitOptions], [generatedChunk, generatedOptions]] =
      createMany.mock.calls;
    expect(explicitChunk).toEqual([expect.objectContaining({ id: 'explicit_id' })]);
    expect(explicitOptions.columnsToMerge).toEqual(['id', 'text', 'type']);
    expect(generatedChunk[0]).not.toHaveProperty('id');
    expect(generatedOptions.columnsToMerge).toEqual(['text', 'type']);
  });
});
