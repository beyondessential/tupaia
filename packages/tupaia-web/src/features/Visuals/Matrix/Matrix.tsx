/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { Matrix as MatrixComponent, NoData, SearchFilter } from '@tupaia/ui-components';
import { DashboardItemType, isMatrixReport } from '@tupaia/types';
import { DashboardItemContext } from '../../DashboardItem';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { MatrixPreview } from './MatrixPreview';
import { parseColumns, parseRows } from './parseData';

const Wrapper = styled.div`
  // override the base table styles to handle expanded rows, which need to be done with classes and JS because nth-child will not handle skipped rows
  tbody .MuiTableRow-root {
    &.odd {
      background-color: ${({ theme }) => theme.palette.table.odd};
    }
    &.even {
      background-color: ${({ theme }) => theme.palette.table.even};
    }
    &.highlighted {
      background-color: ${({ theme }) => theme.palette.table.highlighted};
    }
  }
`;

const NoResultsMessage = styled(Typography)`
  padding: 1rem;
`;

/**
 * This is the component that is used to display a matrix. It handles the parsing of the data into the format that the Matrix component can use, as well as placeholder images. It shows a message when there are no rows available to display.
 */

const testData = [
  {
    dataElement: '21391005',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-QPSI-DI3C',
    },
    'Total Cost (in original currency)': 320,
    Model: 'PC-900',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset Condition': 'Good',
    'Tupaia Reference': 'SMH-QPSI-DI3C',
    Facility: 'Foailalo District Hospital',
    'Asset category (Biomed)': 'Biomedical',
    Project: 'UNOPS Covid 2020',
    'Service contract or in-house maintenance?': 'In-house',
    'Life-span': 10,
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    Manufacturer: 'Shenzhen Creative Industry',
    'Funding Agency': 'SWAp',
    'Original currency': 'USD - US Dollar',
    'Serial number': 'J0100QH03534',
    'Purchase cost (WST)': 1331.26,
    'Asset type': 'Pulse Oximeter, tabletop',
    'Asset Status': 'In-Service',
    Supplier: 'EBOs International',
    'Installation date': '11-05-2021',
    'Warranty end date': '10-05-2022',
    'End of expected life': '11-05-2031',
    'Date survey was submitted': '29-07-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '21391005',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-QPSI-DI3C',
    },
    'Total Cost (in original currency)': 320,
    Model: 'PC-900',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset Condition': 'Good',
    'Tupaia Reference': 'SMH-QPSI-DI3C',
    Facility: 'Foailalo District Hospital',
    'Asset category (Biomed)': 'Biomedical',
    Project: 'UNOPS Covid 2020',
    'Service contract or in-house maintenance?': 'In-house',
    'Life-span': 10,
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    Manufacturer: 'Shenzhen Creative Industry',
    'Funding Agency': 'SWAp',
    'Original currency': 'USD - US Dollar',
    'Serial number': 'J0100QH03534',
    'Purchase cost (WST)': 1331.26,
    'Asset type': 'Pulse Oximeter, tabletop',
    'Asset Status': 'In-Service',
    Supplier: 'EBOs International',
    'Installation date': '11-05-2021',
    'Warranty end date': '10-05-2022',
    'End of expected life': '11-05-2031',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: 'A1052',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-8TAM-4MUQ',
    },
    'Tupaia Reference': 'SMH-8TAM-4MUQ',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'Pelton & Crane',
    'Serial number': '7966',
    'Asset Status': 'In-Service',
    Model: 'M.C',
    'Frequency of Preventative Maintenance': 'Every 6 months',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'CSSD (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Autoclave',
    'Installation date': '01-01-2000',
    'End of expected life': '01-01-2010',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: 'A8793',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-BCRS-YF1M',
    },
    'Tupaia Reference': 'SMH-BCRS-YF1M',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'A R Harris',
    'Serial number': '0',
    'Asset Status': 'In-Service',
    Model: '6026',
    'Asset Condition': 'Fair',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'Outpatient & Emergency (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Nebulizer',
    'Installation date': '01-01-2000',
    'End of expected life': '01-01-2010',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '14191001',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-F34J-26FD',
    },
    'Tupaia Reference': 'SMH-F34J-26FD',
    Facility: 'Foailalo District Hospital',
    Project: 'SWAp PhA Lot 3:37',
    'Life-span': 10,
    Manufacturer: 'Rexmed',
    'Funding Agency': 'SWAp',
    'Serial number': 'RSU-346-13039',
    'Purchase cost (WST)': 1385,
    'Asset Status': 'In-Service',
    Supplier: 'South Austral',
    Model: 'RSU-346',
    'Frequency of Preventative Maintenance': 'Every 6 months',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Suction, Electric',
    'Installation date': '14-12-2013',
    'Warranty end date': '14-12-2014',
    'End of expected life': '14-12-2023',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'No',
  },
  {
    dataElement: '14391000',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-R3TW-EW40',
    },
    'Tupaia Reference': 'SMH-R3TW-EW40',
    Facility: 'Foailalo District Hospital',
    Project: 'SWAp PhA Lot 3:37',
    'Life-span': 10,
    Manufacturer: 'Rexmed',
    'Funding Agency': 'SWAp',
    'Serial number': 'RSU-346-13053',
    'Purchase cost (WST)': 1385,
    'Asset Status': 'In-Service',
    Supplier: 'South Austral',
    Model: 'RSU-346',
    'Frequency of Preventative Maintenance': 'Every 12 months',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Total Cost (in original currency)': 730.9,
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Suction, Electric',
    'Installation date': '20-06-2014',
    'End of expected life': '20-06-2024',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '14391001',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-Y8NE-L1YI',
    },
    'Tupaia Reference': 'SMH-Y8NE-L1YI',
    Facility: 'Foailalo District Hospital',
    Project: 'SWAp PhA Lot 3:42',
    'Life-span': 10,
    Manufacturer: 'Rimsa',
    'Serial number': '11493',
    'Purchase cost (WST)': 706,
    'Asset Status': 'In-Service',
    Supplier: 'South Austral',
    Model: '0',
    'Frequency of Preventative Maintenance': 'Every 6 months',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Total Cost (in original currency)': 358,
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Examination Light',
    'Installation date': '20-06-2014',
    'End of expected life': '20-06-2024',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '20391000',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-GRUW-Q7IC',
    },
    'Tupaia Reference': 'SMH-GRUW-Q7IC',
    Facility: 'Foailalo District Hospital',
    Project: 'Japan Grant Aid Assistance FY17',
    'Life-span': 10,
    Manufacturer: 'Atom',
    'Serial number': '200200683',
    'Purchase cost (WST)': 4000,
    'Asset Status': 'In-Service',
    Supplier: 'Ogawa Seiki Co',
    Model: '108',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Original currency': 'JPY - Yen',
    'Total Cost (in original currency)': 166500,
    'Ward / Area': 'Maternity Ward (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Fetal Doppler, tabletop',
    'Installation date': '09-09-2020',
    'Warranty end date': '08-09-2021',
    'End of expected life': '09-09-2030',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '20391001',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-1PR5-PS18',
    },
    'Tupaia Reference': 'SMH-1PR5-PS18',
    Facility: 'Foailalo District Hospital',
    Project: 'Japan Grant Aid Assistance FY17',
    'Life-span': 10,
    Manufacturer: 'Atom',
    'Serial number': '200300766',
    'Purchase cost (WST)': 35000,
    'Asset Status': 'In-Service',
    Supplier: 'TEC International',
    Model: '103 Infa Warmer i ',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Original currency': 'JPY - Yen',
    'Total Cost (in original currency)': 1423000,
    'Ward / Area': 'Maternity Ward (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Infant Warmer',
    'Installation date': '09-09-2020',
    'Warranty end date': '08-09-2021',
    'End of expected life': '09-09-2030',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '21391000',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-6TL0-TNW3',
    },
    'Tupaia Reference': 'SMH-6TL0-TNW3',
    Facility: 'Foailalo District Hospital',
    Project: 'UNOPS Covid 2020',
    'Life-span': 10,
    Manufacturer: 'Airsep',
    'Serial number': 'CBB0120501031',
    'Asset Status': 'In-Service',
    Supplier: 'UNOPS',
    Model: 'Newlife Intensity 10',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'General Ward (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Oxygen concentrator',
    'Installation date': '22-03-2021',
    'Warranty end date': '22-03-2022',
    'End of expected life': '22-03-2031',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '21391006',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-1O26-B4QW',
    },
    'Tupaia Reference': 'SMH-1O26-B4QW',
    Facility: 'Foailalo District Hospital',
    Project: 'UNOPS Covid 2020',
    'Life-span': 10,
    Manufacturer: 'Shanghai International Holding Corp Gmbh',
    'Serial number': 'DE21-03-41',
    'Asset Status': 'In-Service',
    Supplier: 'UNOPS',
    Model: 'YDX-100P-25A',
    'Asset Condition': 'Good',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Suction, Electrical',
    'Installation date': '03-08-2021',
    'Warranty end date': '03-08-2022',
    'End of expected life': '03-08-2031',
    'Date survey was submitted': '05-09-2024',
    'User who submitted survey': 'Geoff Fisher',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: 'A8793',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-B0HX-A6FE',
    },
    'Tupaia Reference': 'SMH-B0HX-A6FE',
    Facility: 'Foailalo District Hospital',
    'Further description': 'Old machine still working ',
    'Life-span': 10,
    'Was asset purchased by MOH or a donor?': 'Purchased by MOH',
    Manufacturer: 'A R Harris',
    'Asset Status': 'In-Service',
    Supplier: 'EBOs International',
    Model: '6026',
    'Frequency of Preventative Maintenance': 'Every 6 months',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Original currency': 'WST - Tala',
    'Total Cost (in original currency)': 1000,
    'Ward / Area': 'General (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    Accessories: 'filter ',
    'Asset type': 'Nebulizer ',
    'Date received': '02-01-2000',
    'Service Manual': 'Yes',
    'Operator Manual': 'Yes',
    'Installation date': '04-01-2000',
    'Warranty end date': '04-01-2001',
    'End of expected life': '04-01-2010',
    'Date survey was submitted': '06-09-2024',
    'User who submitted survey': 'Siaosi Tuigamala',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '23371005',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-940N-XK12',
    },
    'Tupaia Reference': 'SMH-940N-XK12',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'Nihon Koden',
    'Asset Status': 'In-Service',
    Supplier: 'SPC',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'Asset type': 'ECG Machine',
    'Date received': '09-09-2024',
    'Installation date': '09-09-2024',
    'End of expected life': '09-09-2034',
    'Date survey was submitted': '09-09-2024',
    'User who submitted survey': 'Brandon Schuster',
  },
  {
    dataElement: '23391002',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-C66P-1ELK',
    },
    'Asset type': 'Oxygen Concentrator',
    'Tupaia Reference': 'SMH-C66P-1ELK',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    'Was asset purchased by MOH or a donor?': 'Purchased by a donor',
    Manufacturer: 'Oxtm',
    'Asset Status': 'In-Service',
    Supplier: 'Australian Aid',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Date received': '09-09-2024',
    'Installation date': '09-09-2024',
    'End of expected life': '09-09-2034',
    'Date survey was submitted': '09-09-2024',
    'User who submitted survey': 'John Johnston',
  },
  {
    dataElement: '15391000',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-IPMA-YQQL)',
    },
    'Asset category (Biomed)': 'Biomedical',
    'Tupaia Reference': 'SMH-IPMA-YQQL',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'GIMA',
    'Asset Status': 'In-Service',
    Supplier: 'Australian Aid',
    'Ward / Area': 'Maternity Ward (Foailalo District Hospital)',
    'Asset type': 'Fetal Monitor',
    'Date received': '09-09-2024',
    'Installation date': '09-09-2024',
    'End of expected life': '09-09-2034',
    'Date survey was submitted': '09-09-2024',
    'User who submitted survey': 'Brandon Schuster',
  },
  {
    dataElement: '21391004',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-ESK4-L0I7',
    },
    'Tupaia Reference': 'SMH-ESK4-L0I7',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'Creative Medical',
    'Asset Status': 'In-Service',
    Supplier: 'China Aid',
    'Asset category (Biomed)': 'Biomedical',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Pulse Oximeter',
    'Date received': '09-09-2024',
    'Installation date': '09-09-2024',
    'End of expected life': '09-09-2034',
    'Date survey was submitted': '09-09-2024',
    'User who submitted survey': 'John Johnston',
  },
  {
    dataElement: '21391002',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-N0TO-SRML',
    },
    'Tupaia Reference': 'SMH-N0TO-SRML',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'Biocare',
    'Asset Status': 'In-Service',
    Supplier: 'Unknown',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'In-house',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'Asset type': 'Patient Monitor',
    'Date received': '09-09-2024',
    'Installation date': '09-09-2024',
    'End of expected life': '09-09-2034',
    'Date survey was submitted': '09-09-2024',
    'User who submitted survey': 'John Johnston',
    'Preventative Maintenance required': 'Yes',
  },
  {
    dataElement: '21391003',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-MKRS-SZ9I',
    },
    'Tupaia Reference': 'SMH-MKRS-SZ9I',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'Biocare',
    'Asset Status': 'In-Service',
    Supplier: 'Chinese Donation',
    'Asset category (Biomed)': 'Biomedical',
    'Ward / Area': 'Consultation room (Foailalo District Hospital)',
    'Asset type': 'Patient Monitor',
    'Date received': '09-09-2024',
    'Installation date': '09-09-2024',
    'End of expected life': '09-09-2034',
    'Date survey was submitted': '09-09-2024',
    'User who submitted survey': 'Brandon Schuster',
  },
  {
    dataElement: '19601145',
    dataElement_metadata: {
      link: '/asset_management_samoa/SMH-YFBQ-V500',
    },
    'Tupaia Reference': 'SMH-YFBQ-V500',
    Facility: 'Foailalo District Hospital',
    'Life-span': 10,
    Manufacturer: 'TLC Diagnostics Pty Ltd',
    'Asset Status': 'In-Service',
    Supplier: 'Unknown',
    'Frequency of Preventative Maintenance': 'Every 6 months',
    'Asset category (Biomed)': 'Biomedical',
    'Service contract or in-house maintenance?': 'Service contract',
    'Ward / Area': 'General (Foailalo District Hospital)',
    'SSCSiP Designation': 'Biomedical Equipment',
    'Asset type': 'Nebulizer',
    'Date received': '19-09-2024',
    'Installation date': '19-09-2024',
    'End of expected life': '19-09-2034',
    'Date survey was submitted': '19-09-2024',
    'User who submitted survey': 'John Johnston',
    'Preventative Maintenance required': 'Yes',
  },
];

const MatrixVisual = () => {
  const context = useContext(DashboardItemContext);
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const activeDrillDownId = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  const reportPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_PERIOD);
  const { report } = context;
  if (context?.config?.name !== 'Asset register (Biomedical)') {
    return null;
  }

  // type guard to ensure that the report is a matrix report and config, even though we know it is
  if (!isMatrixReport(report) || context.config?.type !== DashboardItemType.Matrix) return null;
  const { config } = context;
  const { columns = [] } = report;
  const rows = context?.config?.name === 'Asset register (Biomedical)' ? testData : report.rows;

  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  const { drillDown, valueType } = config;

  // memoise the parsed rows and columns so that they don't get recalculated on every render, for performance reasons
  const parsedRows = useMemo(
    () =>
      parseRows(
        rows,
        undefined,
        searchFilters,
        drillDown,
        valueType,
        urlSearchParams,
        setUrlSearchParams,
      ),
    [
      JSON.stringify(rows),
      JSON.stringify(searchFilters),
      JSON.stringify(drillDown),
      valueType,
      JSON.stringify(urlSearchParams),
      setUrlSearchParams,
    ],
  );
  const parsedColumns = useMemo(() => parseColumns(columns), [JSON.stringify(columns)]);

  const updateSearchFilter = ({ key, value }: SearchFilter) => {
    const filtersWithoutKey = searchFilters.filter(filter => filter.key !== key);
    const updatedSearchFilters = value
      ? [
          ...filtersWithoutKey,
          {
            key,
            value,
          },
        ]
      : filtersWithoutKey;

    setSearchFilters(updatedSearchFilters);
  };

  const clearSearchFilter = key => {
    setSearchFilters(searchFilters.filter(filter => filter.key !== key));
  };

  useEffect(() => {
    // if the drillDownId changes, then we need to clear the search filter so that it doesn't persist across different drillDowns
    setSearchFilters([]);
  }, [activeDrillDownId, reportPeriod]);

  if (!parsedRows.length && !searchFilters.length) {
    return <NoData config={config} report={report} />;
  }

  return (
    <Wrapper>
      <MatrixComponent
        {...config}
        rows={parsedRows}
        columns={parsedColumns}
        disableExpand={!!searchFilters.length}
        searchFilters={searchFilters}
        updateSearchFilter={updateSearchFilter}
        clearSearchFilter={clearSearchFilter}
      />
      {searchFilters?.length > 0 && !parsedRows.length && (
        <NoResultsMessage>No results found</NoResultsMessage>
      )}
    </Wrapper>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  // Make sure there is enough space for the mobile warning text
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    min-height: 5rem;
  }
`;

const MobileWarningText = styled.div`
  font-size: 1rem;
  text-align: center;
  width: 100%;
  padding: 0.5rem 0.5rem 1rem;

  @media (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MobileWarning = () => {
  return (
    <MobileWarningText>
      Please note that the Tupaia matrix chart cannot be properly viewed on small screens.
    </MobileWarningText>
  );
};

export const Matrix = () => {
  const { isEnlarged, config } = useContext(DashboardItemContext);
  // add a typeguard here to keep TS happy
  // if the item is not enlarged and is a matrix, then we show the preview, because there won't be any loaded data at this point

  if (config?.type !== DashboardItemType.Matrix) return null;

  const component = isEnlarged ? <MatrixVisual /> : <MatrixPreview config={config} />;

  return (
    <Container>
      <MobileWarning />
      {component}
    </Container>
  );
};
