/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const useParameters = ({ config, onEditField }) => {
  const { additionalParameters = [] } = config;

  const onAdd = () => {
    const defaultNewParameter = {
      id: `parameter_${additionalParameters.length}`,
    };

    onEditField('config', {
      ...config,
      additionalParameters: [...additionalParameters, defaultNewParameter],
    });
  };

  const onDelete = selectedParameterId => {
    const newParameterList = additionalParameters.filter(p => p.id !== selectedParameterId);
    onEditField('config', { ...config, additionalParameters: newParameterList });
  };

  const onChange = (id, key, newValue) => {
    const newParameters = [...additionalParameters];
    const index = additionalParameters.findIndex(p => p.id === id);

    // validate name input
    if (key === 'name') {
      try {
        if (newValue === '') {
          throw new Error('Cannot be empty');
        }

        if (additionalParameters.findIndex(p => p.name === newValue) !== -1) {
          throw new Error('Duplicated parameter name');
        }

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
    }

    newParameters[index][key] = newValue;
    onEditField('config', { ...config, parameters: newParameters });
  };


    onEditField('config', { ...config, additionalParameters: newParameters });
  };

  return { additionalParameters, onAdd, onDelete, onChange };
};

const useSqlEditor = ({ config, onEditField }) => {
  const { sql = '' } = config;
  const setSql = newSql => {
    onEditField('config', { ...config, sql: newSql });
  };
  return { sql, setSql };
};

export const useDataTable = ({ recordData, onEditField }) => {
  const { config = {} } = recordData;
  const {
    additionalParameters,
    onAdd: onParametersAdd,
    onDelete: onParametersDelete,
    onChange: onParametersChange,
  } = useParameters({ config, onEditField });
  const { sql, setSql } = useSqlEditor({ config, onEditField });

  return {
    additionalParameters,
    onParametersAdd,
    onParametersDelete,
    onParametersChange,
    sql,
    setSql,
  };
};
