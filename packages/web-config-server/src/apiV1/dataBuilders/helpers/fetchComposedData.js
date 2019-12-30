import { getDataBuilder } from '/apiV1/dataBuilders/getDataBuilder';

export const fetchComposedData = async (config, dhisApi) => {
  const { dataBuilderConfig, ...otherConfig } = config;
  const { dataBuilders } = dataBuilderConfig || {};
  if (!dataBuilders) {
    throw new Error('Data builders not provided');
  }

  const responses = {};
  const addResponse = async ([builderKey, builderData]) => {
    const { dataBuilder: builderName, dataBuilderConfig: builderConfig } = builderData;
    const buildData = getDataBuilder(builderName);
    responses[builderKey] = await buildData(
      { ...otherConfig, dataBuilderConfig: builderConfig },
      dhisApi,
    );
  };
  await Promise.all(Object.entries(dataBuilders).map(addResponse));

  return responses;
};
