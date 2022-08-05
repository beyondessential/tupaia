import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { getUniqueViewId } from '../../../utils';
import PDFExportSinglePageContent from '../../../containers/PDFExportSinglePageContent';
import { selectCurrentDashboardName } from '../../../selectors';

const Main = styled.div`
  height: 100vh;
  background: white;
  overflow: auto;
`;
const PDFExportPage = ({ currentGroupDashboard, viewResponses }) => {
  if (!currentGroupDashboard) return null;
  const { dashboardCode, entityCode: organisationUnitCode, project, items } = currentGroupDashboard;

  const drillDownItemCodes = items
    .filter(view => !!view.drillDown?.itemCode)
    .map(view => view.drillDown?.itemCode);

  return (
    <Main>
      {items
        .filter(view => !drillDownItemCodes.includes(view.code))
        .map(view => {
          const infoViewKey = getUniqueViewId(organisationUnitCode, dashboardCode, view.code);
          return (
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
          );
        })}
    </Main>
  );
};

PDFExportPage.propTypes = {
  currentGroupDashboard: PropTypes.object,
  viewResponses: PropTypes.object,
};

PDFExportPage.defaultProps = { currentGroupDashboard: null, viewResponses: {} };

const mapStateToProps = state => {
  const { dashboards } = state.global;
  const { viewResponses } = state.dashboard;
  const currentDashboardName = selectCurrentDashboardName(state);
  const currentGroupDashboard = dashboards.find(d => d.dashboardName === currentDashboardName);
  return { currentGroupDashboard, viewResponses };
};

export default connect(mapStateToProps)(PDFExportPage);
