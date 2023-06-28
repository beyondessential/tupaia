/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { LayerGroup, Polygon } from 'react-leaflet';
import styled from 'styled-components';
import {
  AreaTooltip,
  getSingleFormattedValue,
  MEASURE_TYPE_RADIUS,
  MeasureMarker,
  MeasurePopup,
} from '@tupaia/ui-map-components';
import { OrgUnitCode } from '@tupaia/ui-map-components/src/types';

type GenericDataItem = {
  [key: string]: any;
  organisationUnitCode: OrgUnitCode;
};

type Series = any;
type MeasureData = any;

const measureData = [
  {
    organisationUnitCode: 'TO_Kolm2mch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Kolomotu'a 2",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498770034062_716863.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.13956217, 184.78815072],
    region: null,
  },
];

const measureDataResponse = {
  mapOverlayCode: '127',
  measureLevel: 'Facility',
  measureOptions: [
    {
      measureLevel: 'Facility',
      linked_measures: null,
      report_code: '127_map',
      data_builder: 'valueForOrgGroup',
      name: 'Inpatient facilities',
      type: 'color',
      key: '127',
      hideFromMenu: false,
      hideFromLegend: false,
      hideFromPopup: false,
      legacy: true,
      values: [
        { name: 'Yes', value: 1 },
        { name: 'No', value: 0 },
      ],
    },
  ],
  serieses: [
    {
      measureLevel: 'Facility',
      linked_measures: null,
      report_code: '127_map',
      data_builder: 'valueForOrgGroup',
      name: 'Inpatient facilities',
      type: 'color',
      key: '127',
      hideFromMenu: false,
      hideFromLegend: false,
      hideFromPopup: false,
      legacy: true,
      values: [
        { name: 'Yes', value: 1 },
        { name: 'No', value: 0 },
      ],
    },
  ],
  measureData: [{ '127': '0', organisationUnitCode: 'TO_Leimatua', submissionDate: '2018-09-06' }],
  period: {
    latestAvailable: '20180906',
    earliestAvailable: '20180906',
    requested:
      '201806;201807;201808;201809;201810;201811;201812;201901;201902;201903;201904;201905;201906;201907;201908;201909;201910;201911;201912;202001;202002;202003;202004;202005;202006;202007;202008;202009;202010;202011;202012;202101;202102;202103;202104;202105;202106;202107;202108;202109;202110;202111;202112;202201;202202;202203;202204;202205;202206;202207;202208;202209;202210;202211;202212;202301;202302;202303;202304;202305;202306',
  },
};

const exampleSerieses = [
  {
    measureLevel: 'Facility',
    linked_measures: null,
    report_code: '127_map',
    data_builder: 'valueForOrgGroup',
    name: 'Inpatient facilities',
    type: 'color',
    key: '127',
    hideFromMenu: false,
    hideFromLegend: false,
    hideFromPopup: false,
    legacy: true,
    values: [
      { name: 'Yes', value: 1, color: '#0AB45A' },
      { name: 'No', value: 0, color: '#AA0A3C' },
    ],
    valueMapping: {
      '0': { name: 'No', value: 0, color: '#AA0A3C' },
      '1': { name: 'Yes', value: 1, color: '#0AB45A' },
      null: { name: 'No data', value: 'null', color: 'grey' },
    },
  },
];

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

// remove name from the measure data as it's not expected in getSingleFormattedValue
const getTooltipText = ({ name, ...markerData }: GenericDataItem, serieses: Series[]) =>
  `${name}: ${getSingleFormattedValue(markerData, serieses)}`;

// Filter hidden and invalid values and sort measure data
const processData = (measureData: MeasureData[], serieses: Series[]): MeasureData[] => {
  const data = measureData
    .filter(({ coordinates, region }) => region || (coordinates && coordinates.length === 2))
    .filter(({ isHidden }) => !isHidden);

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    data.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  return data;
};

interface MarkerLayerProps {
  entityData: any;
  mapOverlayData: any;
}

export const MarkerLayer = ({ entityData, mapOverlayData }: MarkerLayerProps) => {
  if (!entityData || !mapOverlayData) return null;

  const entities = entityData.children;
  console.log('entities', entities);

  return (
    <LayerGroup>
      {entities.map(entity => {
        if (entity.region) {
          return (
            <ShadedPolygon
              key={entity.code}
              positions={entity.region!}
              pathOptions={
                {
                  // color: measure.color,
                  // fillColor: measure.color,
                }
              }
              {...entity}
            >
              <AreaTooltip text={'test'} />
            </ShadedPolygon>
          );
        }
        // Need to show all values on tooltips even though we toggle off one map overlay
        // const markerData = {
        //   ...measure,
        //   ...(multiOverlayMeasureData &&
        //     multiOverlayMeasureData.find(
        //       ({ organisationUnitCode }) => organisationUnitCode === measure.organisationUnitCode,
        //     )),
        // };
        return (
          <MeasureMarker key={entity.code}>
            {/*<MeasurePopup*/}
            {/*  markerData={markerData}*/}
            {/*  serieses={serieses}*/}
            {/*  onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}*/}
            {/*  multiOverlaySerieses={multiOverlaySerieses}*/}
            {/*/>*/}
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
