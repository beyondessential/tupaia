import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { A4Page, A4PageContent } from '@tupaia/ui-components';
import { Divider as BaseDivider } from '@material-ui/core';
import { getUniqueViewId } from '../../../utils';
import PDFExportSinglePageContent from '../../../containers/PDFExportSinglePageContent';
import { selectCurrentDashboardName } from '../../../selectors';
import PDFExportHeader from '../../../components/PDFExportHeader';
import { decodeLocation } from '../../../historyNavigation/utils';

const DashboardTitleContainer = styled.div`
  text-align: start;
  margin-bottom: 18px;
`;

const DashboardNameText = styled.div`
  font-weight: 500;
  font-size: 20px;
  line-height: 140%;
`;

const Divider = styled(BaseDivider)`
  background-color: black;
  height: 3px;
`;

const PDFExportPage = ({ currentGroupDashboard, viewResponses, selectedDashboardItems }) => {
  if (!currentGroupDashboard) return null;
  // Hacky way to change default background color without touching root css.
  document.body.style.backgroundColor = 'white';
  const {
    dashboardCode,
    dashboardName,
    entityName,
    entityCode: organisationUnitCode,
    project,
    items,
  } = currentGroupDashboard;

  const drillDownItemCodes = items
    .filter(view => !!view.drillDown?.itemCode)
    .map(view => view.drillDown?.itemCode);

  return (
    <div>
      {items
        .filter(view => !drillDownItemCodes.includes(view.code))
        .filter(
          view => selectedDashboardItems.length === 0 || selectedDashboardItems.includes(view.code),
        )
        .map(view => {
          const infoViewKey = getUniqueViewId(organisationUnitCode, dashboardCode, view.code);
          return (
            <A4Page>
              <PDFExportHeader entityName={entityName} />
              <A4PageContent>
                <DashboardTitleContainer>
                  <DashboardNameText>{dashboardName}</DashboardNameText>
                  <Divider />
                </DashboardTitleContainer>
                <PDFExportSinglePageContent
                  viewContent={{
                    ...view,
                    project,
                    dashboardCode,
                    organisationUnitCode,
                    ...viewResponses[infoViewKey],
                  }}
                  infoViewKey={infoViewKey}
                  key={infoViewKey}
                  isExporting
                />
              </A4PageContent>
            </A4Page>
          );
        })}
    </div>
  );
};

PDFExportPage.propTypes = {
  currentGroupDashboard: PropTypes.object,
  viewResponses: PropTypes.object,
  selectedDashboardItems: PropTypes.array,
};

PDFExportPage.defaultProps = {
  currentGroupDashboard: null,
  viewResponses: {},
  selectedDashboardItems: [],
};

const mapStateToProps = state => {
  const { dashboards } = state.global;
  const { viewResponses } = state.dashboard;
  const currentDashboardName = selectCurrentDashboardName(state);
  const currentGroupDashboard = dashboards.find(d => d.dashboardName === currentDashboardName);
  const { routing: location } = state;
  const { SELECTED_DASHBOARD_ITEMS = '' } = decodeLocation(location);
  return {
    currentGroupDashboard,
    viewResponses,
    selectedDashboardItems: SELECTED_DASHBOARD_ITEMS.split(','),
  };
};

export default connect(mapStateToProps)(PDFExportPage);
