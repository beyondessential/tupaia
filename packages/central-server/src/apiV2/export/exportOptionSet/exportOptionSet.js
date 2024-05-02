/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export async function exportOptionSet(req, res) {
  const { models, accessPolicy, userId } = req;
  const { optionSetId } = req.params;

  const optionSetRecord = await models.optionSet.findOne({ id: optionSetId });
  const optionRecords = await optionSetRecord.options();
  const options = optionRecords.map(option => ({
    value: option.value,
    label: option.label,
    sort_order: option.sort_order,
    attributes: option.attributes,
  }));

  res.status(418).type('json').send(options);
}
