/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import FacilityIcon from 'material-ui/svg-icons/maps/local-hospital';
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { setOrgUnit, openMapPopup } from '../actions';
import { selectOrgUnit, selectOrgUnitChildren, selectCodeFromOrgUnit } from '../selectors';
import { DARK_BLUE } from '../styles';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 15px;
  background: black;
  border-bottom: ${p => (p.$hideBottomBorder ? 'none' : `1px solid ${DARK_BLUE}`)};
`;

const StyledButton = styled(Button)`
  margin-left: ${p => p.$nestedMargin}px;
  padding: 0px;
  height: 55px;
  width: 100%;
  text-transform: none;

  .MuiButton-label {
    justify-content: flex-start;
    text-align: left;
  }
`;

const OpenCloseButton = styled(IconButton)`
  opacity: ${p => (p.$isOpen ? 1 : 0.5)};
  color: white;
  font-size: 16pt;
  padding: 3px;

  &:hover {
    opacity: 1;
  }
`;

const ICON_BY_ORG_UNIT_TYPE = {
  Facility: FacilityIcon,
};

const SearchBarItemComponent = ({
  organisationUnitCode,
  name,
  organisationUnitChildren,
  type,
  onClick,
  onClickExpand,
  nestedMargin,
  isFinalRow,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const nestedItems = useMemo(
    () =>
      isOpen &&
      organisationUnitChildren.map((child, index) => (
        <SearchBarItem
          key={child}
          organisationUnitCode={child}
          onClick={onClick}
          nestedMargin={nestedMargin + 24}
          isFinalRow={isFinalRow && index === organisationUnitChildren.length - 1}
        />
      )),
    [organisationUnitChildren, isFinalRow, onClick, nestedMargin, isOpen],
  );
  // always show an expander for country org units, which lazy load their children
  const hasNestedItems = type === 'Country' || organisationUnitChildren.length > 0;

  const Icon = ICON_BY_ORG_UNIT_TYPE[type];

  return (
    <Container key={organisationUnitCode}>
      <Row $hideBottomBorder={isFinalRow && !isOpen}>
        <StyledButton onClick={() => onClick(organisationUnitCode)} $nestedMargin={nestedMargin}>
          {name}
          {Icon && <Icon style={{ opacity: 0.7 }} />}
        </StyledButton>
        {hasNestedItems && (
          <OpenCloseButton
            onClick={() => {
              setIsOpen(!isOpen);
              onClickExpand(organisationUnitCode);
            }}
            $isOpen={isOpen}
          >
            {isOpen ? <RemoveCircleIcon /> : <AddCircleIcon />}
          </OpenCloseButton>
        )}
      </Row>
      {nestedItems}
    </Container>
  );
};

SearchBarItemComponent.propTypes = {
  organisationUnitCode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  organisationUnitChildren: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.func.isRequired,
  onClickExpand: PropTypes.func.isRequired,
  nestedMargin: PropTypes.number,
  isFinalRow: PropTypes.bool.isRequired,
};

SearchBarItemComponent.defaultProps = {
  organisationUnitChildren: [],
  nestedMargin: 0,
};

const mapStateToProps = (state, props) => {
  const orgUnit = selectOrgUnit(state, props.organisationUnitCode);
  const { name, type } = orgUnit;
  const organisationUnitChildren = selectCodeFromOrgUnit(
    selectOrgUnitChildren(state, props.organisationUnitCode),
  );
  return { name, type, organisationUnitChildren };
};

const mapDispatchToProps = dispatch => ({ dispatch });

const mergeProps = (stateProps, { dispatch }, { onClick, ...ownProps }) => ({
  ...stateProps,
  ...ownProps,
  onClick: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode));
    dispatch(openMapPopup(organisationUnitCode));
    if (onClick) {
      onClick(organisationUnitCode);
    }
  },
  onClickExpand: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode));
  },
});

export const SearchBarItem = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(SearchBarItemComponent);
