/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { MatrixWrapper as MatrixWrapperComponent } from '../src/components/View/MatrixWrapper';
import { Matrix } from '../src/components/View/MatrixWrapper/components';

const Container = styled(MuiBox)`
  padding: 1rem;
`;

export default {
  title: 'MatrixWrapper',
  component: MatrixWrapperComponent,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const MatrixWrapperTemplate = args => <MatrixWrapperComponent {...args} />;

export const MatrixWrapper = MatrixWrapperTemplate.bind({});
MatrixWrapper.args = {
  viewContent: {
    rows: [
      {
        description: '11-11-2019',
        eventId: 'v5Xk0RXBKGW',
        organisationUnitName: "V-Hala'ovave",
        trackedEntityInstance: 'EvSCzNByJtR',
        CD3a_003: 'TB',
        CD3a_006: '12',
        CD3a_007: 'CD3-8NI-G6A-LFIK',
        $eventOrgUnitName: "Hala'ovave",
      },
    ],
    columns: [
      { key: 'CD3a_007', title: 'CD Contact Tracing: Case …' },
      {
        key: '$eventOrgUnitName',
        title: 'Village',
      },
      { key: 'CD3a_003', title: 'CD Contact Tracing: Index…' },
      { key: 'CD3a_006', title: 'CD Contact Tracing: Numbe…' },
    ],
    viewId: 'TO_CD_Validation_CD3',
    drillDownLevel: 0,
    organisationUnitCode: 'TO_Kolm2mch',
    dashboardGroupId: '58',
    startDate: '2019-11-01',
    endDate: '2019-11-30',
    name: 'Contact Tracing',
    type: 'matrix',
    drillDown: '{keyLink: "trackedEntityInstance", parameterLink: "…}',
    defaultTimePeriod: '{offset: -1, unit: "month"}',
    periodGranularity: 'one_month_at_a_time',
  },
  organisationUnitName: "Kolomotu'a 2",
  isEnlarged: true,
  isExporting: false,
  presentationOptions: {},
  categoryPresentationOptions: {},
  title: "Contact Tracing, Kolomotu'a 2",
  onRowClick: () => {
    console.log('...');
  },
};
