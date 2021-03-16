/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import { Legend } from '../../src';

const Container = styled.div`
  padding: 1rem;
`;

export default {
  title: 'Map/Legend',
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const measureOptions = [
  {
    customColors: 'RoyalBlue,RoyalBlue,OrangeRed,OrangeRed',
    measureLevel: 'Facility',
    name: 'Operational facilities',
    linkedMeasures: ['171'],
    measureBuilder: 'valueForOrgGroup',
    countryCodes: [],
    projectCodes: ['explore', 'disaster', 'imms', 'fanafana', 'olangch_palau'],
    type: 'icon',
    key: '126',
    hideFromMenu: false,
    hideFromLegend: false,
    hideFromPopup: false,
    values: [
      {
        icon: 'circle',
        name: 'Open',
        value: ['Fully Operational', 'Operational but closed this week'],
        color: '#005AC8',
      },
      {
        icon: 'x',
        name: 'Temporarily closed',
        value: 'Temporarily Closed',
        color: '#FA7850',
      },
      {
        icon: 'triangle',
        name: 'Permanently closed',
        value: 'Permanently Closed',
        color: '#FA78FA',
      },
      {
        icon: 'empty',
        name: 'No data',
        value: 'null',
        color: '#00A0FA',
      },
    ],
    valueMapping: {
      'Fully Operational': {
        icon: 'circle',
        name: 'Open',
        value: ['Fully Operational', 'Operational but closed this week'],
        color: '#005AC8',
      },
      'Operational but closed this week': {
        icon: 'circle',
        name: 'Open',
        value: ['Fully Operational', 'Operational but closed this week'],
        color: '#005AC8',
      },
      'Temporarily Closed': {
        icon: 'x',
        name: 'Temporarily closed',
        value: 'Temporarily Closed',
        color: '#FA7850',
      },
      'Permanently Closed': {
        icon: 'triangle',
        name: 'Permanently closed',
        value: 'Permanently Closed',
        color: '#FA78FA',
      },
      null: {
        icon: 'empty',
        name: 'No data',
        value: 'null',
        color: '#00A0FA',
      },
    },
  },
  {
    measureLevel: 'Facility',
    displayedValueKey: 'facilityTypeName',
    name: 'Facility type',
    linkedMeasures: null,
    measureBuilder: 'valueForOrgGroup',
    countryCodes: [],
    projectCodes: ['explore', 'disaster', 'imms', 'fanafana', 'unfpa', 'olangch_palau'],
    type: 'color',
    key: '171',
    hideFromMenu: true,
    hideFromLegend: false,
    hideFromPopup: false,
    values: [
      {
        name: 'Hospital',
        value: 1,
        color: 'yellow',
      },
      {
        name: 'Community health centre',
        value: 2,
        color: 'teal',
      },
      {
        name: 'Clinic',
        value: 3,
        color: 'green',
      },
      {
        name: 'Aid post',
        value: 4,
        color: 'orange',
      },
      {
        name: 'Other',
        value: 'other',
        color: 'purple',
      },
    ],
    valueMapping: {
      1: {
        name: 'Hospital',
        value: 1,
        color: 'yellow',
      },
      2: {
        name: 'Community health centre',
        value: 2,
        color: 'teal',
      },
      3: {
        name: 'Clinic',
        value: 3,
        color: 'green',
      },
      4: {
        name: 'Aid post',
        value: 4,
        color: 'orange',
      },
      other: {
        name: 'Other',
        value: 'other',
        color: 'purple',
      },
      null: {
        name: 'No data',
        value: 'null',
        color: 'grey',
      },
    },
  },
];

export const SimpleLegend = () => <Legend measureOptions={measureOptions} />;
