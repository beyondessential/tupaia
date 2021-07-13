/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import { ExpandableList } from '../../components/mobile/ExpandableList';
import { SelectListItem } from '../../components/mobile/SelectListItem';
import { WHITE, MOBILE_MARGIN_SIZE } from '../../styles';
import {
  clearMeasure,
  setMeasure,
  setOrgUnit,
  toggleDashboardSelectExpand,
  toggleMeasureExpand,
} from '../../actions';
import { selectCurrentMeasure, selectCurrentOrgUnit, selectOrgUnitChildren } from '../../selectors';
import { getSingleFormattedValue } from '../../utils';
import { ENTITY_TYPE } from '../../constants';
import { filterShape } from '../../components/mobile/FilterSelect';
import BackButton from '../../components/mobile/BackButton';

const Spinner = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2; // Above header.
`;

const NoResultsText = styled.div`
  background-color: ${WHITE};
  padding: ${MOBILE_MARGIN_SIZE}px;
`;

const EntitySearchComponent = ({
  isLoading,
  isMeasureLoading,
  measureFilters,
  measureFilterIsExpanded,
  mobileListItems,
  onChangeMeasure,
  onChangeOrgUnit,
  onToggleMeasureExpand,
  orgUnit,
  selectedFilter,
  title,
}) => {
  if (isLoading) {
    return (
      <Spinner>
        <CircularProgress />
      </Spinner>
    );
  }

  const showBackButton = orgUnit.type !== 'Project';

  return (
    <div>
      <div>
        <ExpandableList
          items={mobileListItems.map(item => (
            <SelectListItem onSelect={onChangeOrgUnit} {...item} />
          ))}
          expandedByDefault
          title={title}
          filterTitle="Measures"
          filters={measureFilters}
          currentFilter={selectedFilter}
          onFilterChange={onChangeMeasure}
          filterIsExpanded={measureFilterIsExpanded}
          onFilterOpen={onToggleMeasureExpand}
          onFilterClose={onToggleMeasureExpand}
          showLoadingIcon={isMeasureLoading}
          theme={{ background: WHITE, color: '#000' }}
        />
        {mobileListItems.length === 0 && !isLoading && (
          <NoResultsText>No clinics found in this region.</NoResultsText>
        )}
      </div>
      {showBackButton && <BackButton orgUnit={orgUnit} />}
    </div>
  );
};

EntitySearchComponent.propTypes = {
  isLoading: PropTypes.bool,
  isMeasureLoading: PropTypes.bool,
  measureFilters: PropTypes.array,
  measureFilterIsExpanded: PropTypes.bool,
  mobileListItems: PropTypes.array,
  orgUnit: PropTypes.object.isRequired,
  onToggleMeasureExpand: PropTypes.func.isRequired,
  onChangeMeasure: PropTypes.func.isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
  selectedFilter: filterShape,
  title: PropTypes.string,
};

EntitySearchComponent.defaultProps = {
  mobileListItems: [],
  measureFilters: [],
  measureFilterIsExpanded: false,
  selectedFilter: null,
  isLoading: false,
  isMeasureLoading: false,
  title: '',
};

const mapDispatchToProps = dispatch => ({
  onChangeMeasure: measureId => dispatch(setMeasure(measureId)),
  onClearMeasure: () => dispatch(clearMeasure()),
  onToggleMeasureExpand: () => dispatch(toggleMeasureExpand()),
  onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
  onChangeOrgUnit: organisationUnitCode => dispatch(setOrgUnit(organisationUnitCode, false)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { onChangeMeasure, onClearMeasure } = dispatchProps;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onChangeMeasure: measure => (measure ? onChangeMeasure(measure.measureId) : onClearMeasure()),
  };
};

const getMeasureFiltersForHierarchy = measureHierarchy => {
  const results = [];

  measureHierarchy.forEach(measureObject => {
    if (measureObject.children) {
      const category = {
        category: measureObject.name,
        items: getMeasureFiltersForHierarchy(measureObject.children),
      };

      results.push(category);
    } else {
      const measure = {
        label: measureObject.name,
        id: String(measureObject.measureId),
        value: measureObject,
      };

      results.push(measure);
    }
  });

  return results;
};

const getListItemsFromOrganisationUnitChildren = (
  organisationUnitChildren,
  isMeasureLoading,
  measureInfo,
) => {
  const { measureOptions, measureData } = measureInfo;

  if (!organisationUnitChildren) return [];

  const getSubtitle =
    isMeasureLoading || !measureData
      ? () => ''
      : code => {
          const dataItem = measureData.find(d => d.organisationUnitCode === code);
          if (!dataItem) return '';
          return getSingleFormattedValue(dataItem, measureOptions);
        };

  return organisationUnitChildren.map(({ name, organisationUnitCode, type }) => ({
    title: name,
    key: organisationUnitCode,
    orgUnitCode: organisationUnitCode,
    subTitle: getSubtitle(organisationUnitCode),
    type,
  }));
};

const mapStateToProps = state => {
  const { isLoadingOrganisationUnit } = state.global;
  const { measureHierarchy, isExpanded } = state.measureBar;
  const { measureInfo, isMeasureLoading } = state.map;
  const currentMeasure = selectCurrentMeasure(state);
  const orgUnit = selectCurrentOrgUnit(state);

  const mobileListItems = getListItemsFromOrganisationUnitChildren(
    selectOrgUnitChildren(state, orgUnit.organisationUnitCode),
    isMeasureLoading,
    measureInfo,
  );

  const title = mobileListItems.some(i => i && i.type === ENTITY_TYPE.FACILITY)
    ? 'Browse Facilities'
    : 'Browse Districts';

  const measureFilters = getMeasureFiltersForHierarchy(measureHierarchy);

  const selectedFilter = currentMeasure.measureId
    ? { label: currentMeasure.name, id: `${currentMeasure.measureId}` }
    : { label: '' };

  return {
    orgUnit,
    mobileListItems,
    measureFilters,
    selectedFilter,
    measureFilterIsExpanded: isExpanded,
    isLoading: isLoadingOrganisationUnit,
    isMeasureLoading,
    title,
  };
};

export const EntityNav = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EntitySearchComponent);
