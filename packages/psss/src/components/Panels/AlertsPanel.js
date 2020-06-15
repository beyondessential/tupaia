/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { checkAlertsPanelIsOpen, closeAlertsPanel } from '../../store';
import { Drawer, DrawerHeader, DrawerHeaderContent } from '../Drawer';
import { countryFlagImage } from '../../utils';

export const AlertsPanelComponent = ({ isOpen, handleClose }) => {
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerHeader heading="Upcoming report" onClose={handleClose}>
        <DrawerHeaderContent
          heading="Acute Fever and Rash (AFR)"
          date="Week 9 Feb 25 - Mar 1, 2020"
          avatarUrl={countryFlagImage('as')}
        />
      </DrawerHeader>
      <div>Panel Content</div>
    </Drawer>
  );
};

AlertsPanelComponent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isOpen: checkAlertsPanelIsOpen(state),
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(closeAlertsPanel()),
});

export const AlertsPanel = connect(mapStateToProps, mapDispatchToProps)(AlertsPanelComponent);
