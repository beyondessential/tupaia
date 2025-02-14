import { useCallback, useEffect, useState } from 'react';
import generateId from 'uuid/v1';

import { useFetchDataTableBuiltInParams } from './query/useFetchDataTableBuiltInParams';
import { useRuntimeParams } from './useRuntimeParams';

const convertRecordDataToFrontendConfig = (additionalParams = []) => {
  return additionalParams.map(p => ({
    ...p,
    id: generateId(),
  }));
};

export const useParams = ({ recordData, onEditField }) => {
  const { data: builtInParams = [] } = useFetchDataTableBuiltInParams(recordData.type);
  const { config = {} } = recordData;
  const [additionalParams, setAdditionalParams] = useState([]);
  const [runtimeParams, setRuntimeParams] = useState({});

  const { upsertRuntimeParam, renameRuntimeParam, removeRuntimeParam } = useRuntimeParams({
    runtimeParams,
    setRuntimeParams,
  });

  useEffect(() => {
    const newAdditionalParams = convertRecordDataToFrontendConfig(config.additionalParams);
    setAdditionalParams(newAdditionalParams);
    const defaultRuntimeParams = Object.fromEntries(
      [...newAdditionalParams, ...builtInParams].map(p => [p.name, undefined]),
    );
    setRuntimeParams(defaultRuntimeParams);
  }, [recordData.type]);

  const onEditAdditionalParams = newAdditionalParams => {
    onEditField('config', {
      ...config,
      additionalParams: newAdditionalParams,
    });

    setAdditionalParams(newAdditionalParams);
  };

  const onParamsAdd = useCallback(() => {
    const defaultNewParam = {
      id: generateId(),
    };

    onEditAdditionalParams([...additionalParams, defaultNewParam]);
  });

  const onParamsDelete = useCallback(selectedParameterId => {
    const parameterToRemove = additionalParams.find(p => p.id === selectedParameterId);
    removeRuntimeParam(parameterToRemove.name);
    const newParameterList = additionalParams.filter(p => p.id !== selectedParameterId);
    onEditAdditionalParams(newParameterList);
  });

  const onParamsChange = useCallback((id, key, newValue) => {
    const newParams = [...additionalParams];
    const index = additionalParams.findIndex(p => p.id === id);

    switch (key) {
      case 'name': {
        try {
          if (newValue === '') {
            throw new Error('Cannot be empty');
          }

          if (additionalParams.findIndex(p => p.name === newValue) !== -1) {
            throw new Error('Duplicated parameter name');
          }

          // Parameter name cannot contain space or special characters so that they can be used in sql query
          const regex = new RegExp('^[A-Za-z0-9_]+$');
          if (!regex.test(newValue)) {
            throw new Error('Contains space or special characters');
          }

          newParams[index].hasError = false;
          newParams[index].error = '';
        } catch (e) {
          newParams[index].hasError = true;
          newParams[index].error = e.message;
        } finally {
          const oldName = newParams[index].name;
          newParams[index].name = newValue;
          renameRuntimeParam(oldName, newValue);
        }
        break;
      }
      case 'type': {
        const { name } = newParams[index];
        upsertRuntimeParam(name, undefined);
        const newConfig = { type: newValue };
        newParams[index].config = newConfig;
        break;
      }
      default: {
        const newConfig = { ...newParams[index].config, [key]: newValue };
        newParams[index].config = newConfig;
        break;
      }
    }

    onEditAdditionalParams(newParams);
  });

  return {
    builtInParams,
    additionalParams,
    onParamsAdd,
    onParamsDelete,
    onParamsChange,
    runtimeParams,
    upsertRuntimeParam,
  };
};
