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
  {
    organisationUnitCode: 'TO_HmaHC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Houma',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498604279949_682583.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.16801221, 184.69500613],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Klovaihc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Kolovai',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512332_369339.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.10170694, 184.66078101],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Kolf1mch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Kolofo'ou 1",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512337_638466.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.13898, 184.808128],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Taaneamch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Ta'anea",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1499306409984_609370.png',
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.60799862, 186.06356577],
    region: null,
  },
  {
    organisationUnitCode: 'TO_KlongaHC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Kolonga',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498771206772_162976.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.127011677, 184.927852263],
    region: null,
  },
  {
    organisationUnitCode: 'TO_CPMS',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'CPMS',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.140273, 184.794035],
    region: null,
  },
  {
    organisationUnitCode: 'TO_NomukaHC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Nomuka',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500499702715_183682.png',
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-20.26076425, 185.20156158],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Uihamch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Uiha',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500520104337_868859.png',
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-19.891530573, 185.591178122],
    region: null,
  },
  {
    organisationUnitCode: 'TO_kau',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Kauvai',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500966230518_854322.png',
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-19.682913, 185.722092],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Vainihc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Vaini',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498597765658_346751.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.19165802, 184.81763612],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Neiafu2',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Neiafu 2 Mobile RH Clinic',
    photoUrl: null,
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.638083, 186.026139],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Kupesi',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Kupesi',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.237375021, 184.866527346],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Makeke',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Makeke',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.212025612, 184.792614504],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Muahc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Mu'a Health Center (Service)",
    photoUrl: 'https://tupaia.s3.amazonaws.com/uploads/images/1498682386079_548345.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.1934444, 184.8739257],
    region: null,
  },
  {
    organisationUnitCode: 'TO_FPC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Family Planning Clinic',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.1399, 184.794],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Nukuhc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Nukunuku',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512341_387730.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.13593045, 184.69830548],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Neiafu1',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Neiafu 1 Mobile RH Clinic',
    photoUrl: null,
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.662333, 186.001722],
    region: null,
  },
  {
    organisationUnitCode: 'TO_HfevaHC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Ha'afeva",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500511005224_348904.png',
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-19.95247528, 185.2905631],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Peamch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Pea',
    photoUrl: 'https://tupaia.s3.amazonaws.com/uploads/images/1498770013933_1578.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.170208, 184.762101],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Kolf2mch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Kolofo'ou 2",
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.1445, 184.802806],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Ntthc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Niuatoputapu',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500254586225_818944.png',
    parent: 'TO_Niuas',
    isComplete: true,
    coordinates: [-15.94704713, 186.23231994],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Muaisolation',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Mu'a Health Center (Isolation)",
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.18486718, 184.8768983],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Tanao',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Tanoa',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.134889618, 184.805404135],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Simon',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Simon',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.138630973, 184.802002789],
    region: null,
  },
  {
    organisationUnitCode: 'TO_to',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Tofoa',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1499219838695_374290.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.15610233, 184.77539689],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Emerald',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Emerald',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.13471204, 184.804235626],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Taliai',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Taliai',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.241151986, 184.864702487],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Kolm1mch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Kolomotu'a 1",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498770022012_22713.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.12666395, 184.78780237],
    region: null,
  },
  {
    organisationUnitCode: 'TO_UniversalHC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Universal Clinic & Pharmacy',
    photoUrl: null,
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.1399512, 184.7934707],
    region: null,
  },
  {
    organisationUnitCode: 'TO_FmotuHC',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Fua'amotu",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498778322659_158180.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.26266656, 184.85864403],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Nguhp',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Ngu Hospital Pharmacy',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500254549456_25032.png',
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.64584311, 186.01596237],
    region: null,
  },
  {
    organisationUnitCode: 'TO_VHP',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Vaiola Hospital',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512254_723266.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.15515, 184.781183],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Neikihp',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Niu'eiki Hospital",
    photoUrl: 'https://tupaia.s3.amazonaws.com/uploads/images/1499203840013_216186.png',
    parent: 'TO_Eua',
    isComplete: true,
    coordinates: [-21.36607013, 185.0448385],
    region: null,
  },
  {
    '127': '0',
    organisationUnitCode: 'TO_Leimatua',
    submissionDate: '2018-09-06',
    isHidden: false,
    color: '#AA0A3C',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Leimatu'a RH Mobile Clinic",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1499305215318_125410.png',
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.599783, 186.018844],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Niuuihp',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Niu'ui Hospital",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500254642623_888002.png',
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-19.81670527, 185.64076549],
    region: null,
  },
  {
    organisationUnitCode: 'TO_FoaMCH',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Foa',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500421313836_578605.png',
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-19.74092979, 185.69427584],
    region: null,
  },
  {
    organisationUnitCode: 'TO_princessfusipala',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Princess Fusipala Hospital',
    photoUrl: null,
    parent: 'TO_Haapai',
    isComplete: true,
    coordinates: [-19.8031268, 185.6531337],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Mfnga1mch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Ma'ufanga",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498775368165_895315.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.14102639, 184.82064679],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Nfoouhc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: "Niuafo'ou ",
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1500257130116_163901.png',
    parent: 'TO_Niuas',
    isComplete: true,
    coordinates: [-15.573280178, 184.360907519],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Tefisihc',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Tefisi',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1499489588784_647646.png',
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.632301164, 185.988423387],
    region: null,
  },
  {
    organisationUnitCode: 'TO_HvlMCH',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Haveluloto',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498684307634_480266.png',
    parent: 'TO_Tongatapu',
    isComplete: true,
    coordinates: [-21.15151207, 184.783553],
    region: null,
  },
  {
    organisationUnitCode: 'TO_Hungamch',
    isHidden: false,
    color: 'grey',
    icon: 'healthPin',
    type: 'Facility',
    countryCode: 'TO',
    name: 'Hunga',
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1499650856673_546295.png',
    parent: 'TO_Vavau',
    isComplete: true,
    coordinates: [-18.687258664, 185.878880829],
    region: null,
  },
];
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

const serieses = [
  {
    name: 'Inpatient facilities',
    code: '127',
    reportCode: '127_map',
    legacy: true,
    displayType: 'color',
    measureLevel: 'Facility',
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
  measureData: MeasureData[];
  serieses: Series[];
  multiOverlayMeasureData: GenericDataItem[];
  multiOverlaySerieses: Series[];
  onSeeOrgUnitDashboard: (organisationUnitCode?: string) => void;
}

export const MarkerLayer = ({
  measureData: md,
  serieses: sd,
  multiOverlayMeasureData,
  multiOverlaySerieses,
  onSeeOrgUnitDashboard,
}: MarkerLayerProps) => {
  if (!measureData || !serieses) return null;

  console.log('measureData', JSON.stringify(md));
  console.log('serieses', JSON.stringify(sd));

  // const data = processData(measureData, serieses);

  return (
    <LayerGroup>
      {measureData.map((measure: MeasureData) => {
        if (measure.region) {
          return (
            <ShadedPolygon
              key={measure.organisationUnitCode}
              positions={measure.region!}
              pathOptions={{
                color: measure.color,
                fillColor: measure.color,
              }}
              {...measure}
            >
              <AreaTooltip text={getTooltipText(measure, serieses)} />
            </ShadedPolygon>
          );
        }
        // Need to show all values on tooltips even though we toggle off one map overlay
        const markerData = {
          ...measure,
          ...(multiOverlayMeasureData &&
            multiOverlayMeasureData.find(
              ({ organisationUnitCode }) => organisationUnitCode === measure.organisationUnitCode,
            )),
        };
        return (
          <MeasureMarker key={measure.organisationUnitCode} {...measure}>
            <MeasurePopup
              markerData={markerData}
              serieses={serieses}
              onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
              multiOverlaySerieses={multiOverlaySerieses}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
