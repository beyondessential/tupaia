/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Expand from 'material-ui/svg-icons/navigation/expand-more';
import Collapse from 'material-ui/svg-icons/navigation/expand-less';

import FilterSelect from '../FilterSelect';
import { MOBILE_MARGIN_SIZE } from '../../../styles';

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const Toggle = styled.div`
  text-align: right;
`;

const List = styled.div`
  grid-column: 1 / 3;
`;

const Container = styled.div`
  padding: 20px ${MOBILE_MARGIN_SIZE}px 0;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  overflow: hidden;
  justify-content: space-between;
  background: ${p => p.background};
  color: ${p => p.color};
`;

const materialStyles = {
  expandCollapseIcon: {
    width: 32,
    height: 32,
  },
};

export class ExpandableList extends PureComponent {
  state = {
    isListExpanded: this.props.expandedByDefault,
  };

  onExpandCollapseClick = () => {
    const { handleExpandCollapseClick, isExpanded } = this.props;
    if (handleExpandCollapseClick) {
      handleExpandCollapseClick(!isExpanded);
    } else {
      this.setState(state => ({ isListExpanded: !state.isListExpanded }));
    }
  };

  render() {
    const {
      title,
      theme,
      items,
      filterTitle,
      filters,
      filterIsExpanded,
      currentFilter,
      onFilterClose,
      onFilterOpen,
      onFilterChange,
      showLoadingIcon,
    } = this.props;
    const isExpanded = this.props.isExpanded || this.state.isListExpanded;

    return (
      <Container background={theme.background} color={theme.color}>
        <Title>{title}</Title>
        <Toggle onClick={this.onExpandCollapseClick}>
          {isExpanded ? (
            <Collapse style={materialStyles.expandCollapseIcon} color={theme.color} />
          ) : (
            <Expand style={materialStyles.expandCollapseIcon} color={theme.color} />
          )}
        </Toggle>
        {isExpanded && (
          <List>
            {filters && filters.length > 1 ? (
              <FilterSelect
                filters={filters}
                filterIsExpanded={filterIsExpanded}
                currentFilter={currentFilter}
                onFilterOpen={onFilterOpen}
                onFilterClose={onFilterClose}
                onFilterChange={onFilterChange}
                theme={theme}
                showLoadingIcon={showLoadingIcon}
                title={filterTitle}
              />
            ) : (
              <div>{currentFilter ? currentFilter.label : ''}</div>
            )}
            {items.map(item => item)}
          </List>
        )}
      </Container>
    );
  }
}
