import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { FetchLoader, NoData } from '@tupaia/ui-components';
import { getIsChartData } from '@tupaia/ui-chart-components';
import PropTypes from 'prop-types';
import { VisualHeader } from '../VisualHeader';
import { FavouriteButton } from '../../FavouriteButton';
import { YearLabel } from '../../YearLabel';
import { ColorCircle } from './ColorCircle';
import { HeaderRow, StandardRow, SubHeaderRow, LinkRow } from './Rows';

const Container = styled.div`
  position: relative;
  border-radius: 3px;
  overflow: hidden;
  min-height: 400px;
  border: 1px solid ${props => (props.isEnlarged ? props.theme.palette.grey['400'] : 'none')};
  border-collapse: collapse;
  height: ${props => (props.isLoading ? '400px' : 'auto')};
  background: #f9f9f9;
`;

const NoDataContainer = styled(Container)`
  display: flex;
`;

const ROW_TYPE_COMPONENTS = {
  header: HeaderRow,
  subheader: SubHeaderRow,
  standard: StandardRow,
};

const VALUE_TYPE_COMPONENTS = {
  color: ColorCircle,
};

const DEFAULT_LIST_CONFIGS = {
  COLOR: {
    0: { color: '#ffc701', label: 'Yellow' },
    1: { color: '#02B851', label: 'Green' },
    '-1': { color: '#D13333', label: 'Red' },
  },
};

const getDisplayConfig = ({ valueType, listConfig }, statistic) => {
  switch (valueType) {
    case 'color':
      if (listConfig) {
        return listConfig[statistic];
      }
      return DEFAULT_LIST_CONFIGS.COLOR[statistic] || null;
    default:
      return null;
  }
};

const processData = (config, data, reportCodes) => {
  let parentCode = null;

  return data?.map(item => {
    let rowType = 'standard';
    let displayConfig = null;
    let drillDownReportCode = null;

    if (!item.parent) {
      rowType = 'header';
      parentCode = item.code;
    }

    if (item.parent === parentCode) {
      rowType = 'subheader';
    }

    if (config?.drillDown?.itemCodeByEntry[item.code] !== undefined) {
      const drillDownCode = config?.drillDown?.itemCodeByEntry[item.code];

      // check that the drill down config exists before trying to render a drilldown row
      if (reportCodes[drillDownCode] !== undefined) {
        drillDownReportCode = reportCodes[drillDownCode];
      }
    }

    if (item.statistic !== undefined) {
      displayConfig = getDisplayConfig(config, item.statistic);
    }

    return { ...item, rowType, valueType: config.valueType, displayConfig, drillDownReportCode };
  });
};

// eslint-disable-next-line react/prop-types
const DrillDownLink = ({ pathname, reportCode, children }) => {
  const { search } = useLocation();
  return (
    <LinkRow
      to={{
        pathname,
        search: `${search}&reportCode=${reportCode}`,
      }}
    >
      {children}
    </LinkRow>
  );
};

const ListVisualContent = React.memo(
  ({ config, report, isLoading, isError, error, drilldownPathname, reportCodes, isEnlarged }) => {
    const { data } = report;

    const list = processData(config, data, reportCodes);

    if (!isLoading && !getIsChartData(config?.chartType, report)) {
      return (
        <NoDataContainer>
          <NoData config={config} report={report} />
        </NoDataContainer>
      );
    }

    return (
      <Container isLoading={isLoading} isEnlarged={isEnlarged}>
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          {list?.map(({ rowType, valueType, label, displayConfig, drillDownReportCode }, index) => {
            const ValueComponent = VALUE_TYPE_COMPONENTS[valueType];
            const RowComponent = ROW_TYPE_COMPONENTS[rowType];

            const Row = () => (
              <RowComponent label={label}>
                <ValueComponent displayConfig={displayConfig} />
              </RowComponent>
            );

            return drillDownReportCode ? (
              <DrillDownLink
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                pathname={drilldownPathname}
                reportCode={drillDownReportCode}
              >
                <Row />
              </DrillDownLink>
            ) : (
              // eslint-disable-next-line react/no-array-index-key
              <Row key={index} />
            );
          })}
        </FetchLoader>
      </Container>
    );
  },
);

ListVisualContent.propTypes = {
  drilldownPathname: PropTypes.string,
  config: PropTypes.object,
  report: PropTypes.object,
  reportCodes: PropTypes.object,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isError: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  error: PropTypes.string,
};

ListVisualContent.defaultProps = {
  drilldownPathname: null,
  config: {},
  report: {},
  reportCodes: null,
  isLoading: false,
  isFetching: false,
  isError: false,
  isEnlarged: false,
  error: null,
};

export const ListVisual = props => {
  const { name, isEnlarged, isFavourite, handleFavouriteStatusChange, useYearSelector } = props;

  return (
    <>
      {!isEnlarged && (
        <VisualHeader name={name}>
          <YearLabel useYearSelector={useYearSelector} />
          <FavouriteButton
            isFavourite={isFavourite}
            handleFavouriteStatusChange={handleFavouriteStatusChange}
          />
        </VisualHeader>
      )}
      <ListVisualContent {...props} />
    </>
  );
};

ListVisual.propTypes = {
  isEnlarged: PropTypes.bool,
  useYearSelector: PropTypes.bool,
  name: PropTypes.string,
  isFavourite: PropTypes.bool.isRequired,
  handleFavouriteStatusChange: PropTypes.func,
};

ListVisual.defaultProps = {
  isEnlarged: false,
  useYearSelector: false,
  name: null,
  handleFavouriteStatusChange: () => {},
};
