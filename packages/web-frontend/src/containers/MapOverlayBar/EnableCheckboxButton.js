/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import MuiIconButton from '@material-ui/core/IconButton';
import { onSelectMultipleMapOverlayCheckBox } from '../../actions';

const IconButton = styled(MuiIconButton)`
  margin: 0 0 0 1rem;
  padding: 10px 8px 10px 12px;
`;

export const EnableCheckboxButtonComponent = ({ onSelectMultipleMapOverlayCheckbox }) => {
  return (
    <IconButton
      onClick={() => {
        onSelectMultipleMapOverlayCheckbox();
      }}
    >
      <LibraryAddCheckIcon />
    </IconButton>
  );
};

EnableCheckboxButtonComponent.propTypes = {
  onSelectMultipleMapOverlayCheckbox: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { multipleMapOverlayCheckbox } = state.mapOverlayBar;

  return {
    multipleMapOverlayCheckbox,
  };
};

const mapDispatchToProps = dispatch => ({
  onSelectMultipleMapOverlayCheckbox: () => dispatch(onSelectMultipleMapOverlayCheckBox()),
});

export const EnableCheckboxButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnableCheckboxButtonComponent);
