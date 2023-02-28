/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const convertRecordDataToFronendConfig = (additionalParameters = []) => {
  return additionalParameters.map((p, index) => ({
    ...p,
    id: `parameter_${index}`,
  }));
};

export const useParameters = ({ recordData, onEditField }) => {
  const { config = {} } = recordData;

  const additionalParameters = convertRecordDataToFronendConfig(config.additionalParameters);

  const onParametersAdd = () => {
    const defaultNewParameter = {
      id: `parameter_${additionalParameters.length}`,
    };

    onEditField('config', {
      ...config,
      additionalParameters: [...additionalParameters, defaultNewParameter],
    });
  };

  const onParametersDelete = selectedParameterId => {
    const newParameterList = additionalParameters.filter(p => p.id !== selectedParameterId);
    onEditField('config', { ...config, additionalParameters: newParameterList });
  };

  const onParametersChange = (id, key, newValue) => {
    const newParameters = [...additionalParameters];
    const index = additionalParameters.findIndex(p => p.id === id);

    switch (key) {
      case 'name': {
        try {
          if (newValue === '') {
            throw new Error('Cannot be empty');
          }

          if (additionalParameters.findIndex(p => p.name === newValue) !== -1) {
            throw new Error('Duplicated parameter name');
          }

          // Parameter name cannot contain space or special characters so that they can be used in sql query
          const regex = new RegExp('^[A-Za-z0-9_]+$');
          if (!regex.test(newValue)) {
            throw new Error('Contains space or special characters');
          }

          newParameters[index].hasError = false;
          newParameters[index].error = '';
        } catch (e) {
          newParameters[index].hasError = true;
          newParameters[index].error = e.message;
        }
        break;
      }
      default: {
        const newConfig = { ...newParameters[index].config, [key]: newValue };
        newParameters[index].config = newConfig;
        break;
      }
    }

    onEditField('config', { ...config, additionalParameters: newParameters });
  };

  return { additionalParameters, onParametersAdd, onParametersDelete, onParametersChange };
};
