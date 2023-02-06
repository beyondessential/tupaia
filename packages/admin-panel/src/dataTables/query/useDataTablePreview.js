/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { post } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

/**
 * {
    "code": "data_lake_db_test",
    "type": "sql",
    "config": {
      "sql": "SELECT * FROM Table",
      "externalDatabaseConnectionCode": "db_code",
      "additionalParameters": [
        {
          "name": "entityCode",
          "config": {
            "type": "string"
          },
          "inputFilterValue": "AU_SA%"
        }
      ]
    },
    "permission_groups": [
      "*"
    ]
  }

* => 
  * {
    "code": "data_lake_db_test",
    "type": "sql",
    "config": {
      "sql": "SELECT * FROM Table",
      "externalDatabaseConnectionCode": "db_code"
    },
    "additionalParameters": [
      {
        "name": "entityCode",
        "config": {
          "type": "string"
        }
      }
    ],
    "entityCode": "AU_SA%",
    "permission_groups": [
      "*"
    ]
  }
*/
const pullValidConfig = previewConfig => {
  const { code, type, config, permission_groups: permissionGroups } = previewConfig;
  const { additionalParameters, ...restOfConfig } = config;
  const filterInputValues = {};
  const newAdditionalParameters = [];

  additionalParameters.forEach(p => {
    newAdditionalParameters.push({ name: p.name, config: p.config });
    filterInputValues[p.name] = p.inputFilterValue;
  });

  return {
    code,
    type,
    config: restOfConfig,
    permission_groups: permissionGroups,
    ...filterInputValues,
  };
};

export const useDataTablePreview = ({ previewConfig, onSettled }) =>
  useQuery(
    ['fetchDataTablePreviewData', previewConfig],
    async () => {
      const newPreviewConfig = pullValidConfig(previewConfig);

      const response = await post('fetchDataTablePreviewData', {
        data: {
          previewConfig: newPreviewConfig,
        },
      });

      return response;
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      // do not use query cache here because report data
      // should be refetched frequently according to config changes
      enabled: false,
      keepPreviousData: true,
      onSettled,
    },
  );
