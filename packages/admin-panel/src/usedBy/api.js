/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const getUsedBy = async (api, recordType, recordId) => {
  if (recordType === 'dataSource') {
    const response = await api.get(
      `questions?filter=${encodeURIComponent(JSON.stringify({ data_source_id: recordId }))}`,
    );
    return response.body.map(question => ({
      type: 'question',
      name: question.name,
      url: `/surveys/questions?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: question.code }]),
      )}`,
    }));
  }
  throw new Error('Unknown record type');
};
