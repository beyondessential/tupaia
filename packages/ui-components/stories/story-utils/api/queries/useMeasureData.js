/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import axios from 'axios';
import { useQuery } from 'react-query';
import { useOrgUnitData } from './useOrgUnitData';
import {
  createValueMapping,
  getSpectrumScaleValues,
  autoAssignColors,
  SPECTRUM_MEASURE_TYPES,
  getMeasureDisplayInfo,
} from '../../../../src';

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const useMeasureData = ({ projectCode, organisationUnitCode }) => {
  const { data: orgUnitData } = useOrgUnitData({
    projectCode,
    organisationUnitCode,
    includeCountryData: true,
  });

  const params = {
    measureId: '126,171',
    organisationUnitCode,
    projectCode,
    shouldShowAllParentCountryResults: true,
  };

  const { data: measureData, ...query } = useQuery(
    ['measureData', params],
    () =>
      axios(`${baseUrl}measureData`, {
        params,
        withCredentials: true,
        timeout: 30 * 1000,
      }).then(res => res.data),
    { staleTime: 60 * 60 * 1000, enabled: !!orgUnitData?.organisationUnitCode },
  );

  // processMeasureInfo
  const processedMeasureInfo = measureData ? processMeasureInfo(measureData) : null;

  // processMeasureData
  const processedMeasureData = measureData
    ? processMeasureData({
        data: measureData.measureData,
        orgUnitData,
        measureOptions: processedMeasureInfo.measureOptions,
      })
    : null;

  return {
    ...query,
    data: { ...measureData, ...processedMeasureInfo, measureData: processedMeasureData },
  };
};

function processMeasureData({ data, orgUnitData, measureOptions }) {
  const measureOrgUnits = data.map(m => m.organisationUnitCode);

  return orgUnitData.countryHierarchy
    ?.filter(orgUnit => measureOrgUnits?.includes(orgUnit.organisationUnitCode))
    .map(orgUnit => {
      const measure = data.find(m => m.organisationUnitCode === orgUnit.organisationUnitCode);
      const displayInfo = getMeasureDisplayInfo(measure, measureOptions);

      return {
        ...orgUnit,
        ...measure,
        coordinates: orgUnit.location.point,
        region: orgUnit.location.region,
        color: displayInfo.color,
        icon: displayInfo.icon,
        originalValue: null,
      };
    });
}

function processMeasureInfo(response) {
  const { measureOptions, measureData, ...rest } = response;

  // loop through measure options (usually just one)
  const processedOptions = measureOptions.map(measureOption => {
    const { values: mapOptionValues, type, scaleType } = measureOption;

    // assign colors
    const values = autoAssignColors(mapOptionValues);

    // value mapping?
    const valueMapping = createValueMapping(values, type);

    //
    if (SPECTRUM_MEASURE_TYPES.includes(type)) {
      // for each spectrum, include the minimum and maximum values for
      // use in the legend scale labels.
      const { min, max } = getSpectrumScaleValues(measureData, measureOption);

      // A grey no data colour looks like part of the neutral scale
      const noDataColour = scaleType === 'neutral' ? 'black' : '#c7c7c7';

      return {
        ...measureOption,
        values,
        valueMapping,
        min,
        max,
        noDataColour,
      };
    }

    return {
      ...measureOption,
      values,
      valueMapping,
    };
  });

  return {
    measureOptions: processedOptions,
    measureData,
    ...rest,
  };
}
