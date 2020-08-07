/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * DashboardItem
 *
 * Represents a single infoview. Renders a loading indicator while it waits on saga to get
 * the data to render. Takes a prop from react parent that indicates what data to fetch. Should
 * cache the data in redux state, only being cleared when org unit changes; should remain on tab
 * changes.
 *
 * Example viewContent from barchart
  {
    "type":"chart",
    "chartType":"bar",
    "valueType": "percentage",
    "xName":"Clinic",
    "yName":"%",
    "name":"Medicines available by Clinic",
    "presentationOptions": { // for stacked bar chart
      "valueKey1": { "color": "#111111", "label": "Satanic" },
      "valueKey2": { "color": "#222222", "label": "Nesting" },
      "valueKey3": { "color": "#333333", "label": "HelpMe" }
    },
    "data": [{"name": "Balwyn", "code": "b", "value": 0.5},
            {"name": "Marla", "code": "m", "value": 0.75},
            ...],
          Or for stacked chart:
            [
              {"name": "Balwyn", "code": "b", "valueKey1": 0.5, "valueKey2": 0.2, "valueKey3": 0.3},
              {"name": "Marla", "code": "m", "valueKey1": 0.75, "valueKey2": 0.5, "valueKey3": 0.5},
            ...],
  }
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { View } from '../../components/View';
import { fetchDashboardItemData, openEnlargedDialog } from '../../actions';
import { selectCurrentOrgUnit, selectOrgUnit } from '../../selectors';

export class DashboardItem extends Component {
  componentWillMount() {
    this.updateCharts(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.infoViewKey !== this.props.infoViewKey ||
      this.props.organisationUnit !== nextProps.organisationUnit ||
      this.props.disasters !== nextProps.disasters
    ) {
      this.updateCharts(nextProps);
    }
  }

  updateCharts() {
    const { viewContent, viewConfig, fetchContent, infoViewKey } = this.props;
    const { viewId, dashboardGroupId, organisationUnitCode, project } = viewConfig;

    if (!viewContent) {
      fetchContent(organisationUnitCode, dashboardGroupId, viewId, infoViewKey, project);
    } else if (isEmpty(viewContent.data)) {
      fetchContent(organisationUnitCode, dashboardGroupId, viewId, infoViewKey, project);
    }
  }

  render() {
    const {
      viewContent,
      isSidePanelExpanded,
      onEnlarge,
      viewConfig,
      infoViewKey,
      organisationUnitName,
      viewContentOrganisationUnitName,
    } = this.props;
    return (
      <View
        viewContent={viewContent}
        viewConfig={viewConfig}
        organisationUnitName={organisationUnitName}
        onEnlarge={() => onEnlarge(viewContent, viewContentOrganisationUnitName, infoViewKey)}
        isSidePanelExpanded={isSidePanelExpanded}
      />
    );
  }
}

DashboardItem.propTypes = {
  viewContent: PropTypes.shape({}),
  viewConfig: PropTypes.shape({}).isRequired,
  fetchContent: PropTypes.func.isRequired,
  infoViewKey: PropTypes.string.isRequired,
  organisationUnitName: PropTypes.string,
  viewContentOrganisationUnitName: PropTypes.string,
  organisationUnit: PropTypes.shape({}),
  onEnlarge: PropTypes.func,
  isSidePanelExpanded: PropTypes.bool,
};

DashboardItem.defaultProps = {
  viewContent: null,
  isSidePanelExpanded: false,
  organisationUnitName: '',
  viewContentOrganisationUnitName: '',
  organisationUnit: null,
  onEnlarge: () => {},
};

const mapStateToProps = (state, { infoViewKey }) => {
  const { viewResponses } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const viewContent = viewResponses[infoViewKey];
  //Issue: https://github.com/beyondessential/tupaia-backlog/issues/937
  //Ideally, the currentOrganisationUnit should always be similar to the organisationUnit of the view content
  //However, sometimes, we have timing issue when changing the current organisation unit and opening the enlarge dialog at the same time.
  //So, we pass in the name of the organisation unit of the orgUnit inside viewContent instead of always assuming 
  //it's the same with the current organisation unit to avoid confusion that the org unit doesn't match with the data showing
  const viewContentOrganisationUnit = viewContent
    ? selectOrgUnit(state, viewContent.organisationUnitCode)
    : null;
  const viewContentOrganisationUnitName = viewContentOrganisationUnit
    ? viewContentOrganisationUnit.name
    : currentOrganisationUnit.name;

  return {
    viewContent,
    viewContentOrganisationUnitName,
    organisationUnit: currentOrganisationUnit, // Necessary for merge props.
    organisationUnitName: currentOrganisationUnit.name,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchContent: (organisationUnitCode, dashboardGroupId, viewId, infoViewKey, project) =>
    dispatch(
      fetchDashboardItemData(organisationUnitCode, dashboardGroupId, viewId, infoViewKey, project),
    ),
  onEnlarge: (viewContent, organisationUnitName, infoViewKey) =>
    dispatch(openEnlargedDialog(viewContent, organisationUnitName, infoViewKey)),
  dispatch, // Necessary for merge props.
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardItem);
