/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, ErrorAlert, ButtonSelect } from '@tupaia/ui-components';
import * as COLORS from '../theme/colors';
import { Drawer, DrawerHeaderContent, DrawerFooter, DrawerHeader } from './Drawer';
import { SiteAddress } from './SiteAddress';

// dummy data
const options = [
  { name: 'Afghanistan', id: 'AF' },
  { name: 'Albania', id: 'AL' },
  { name: 'Algeria', id: 'DZ' },
  { name: 'Angola', id: 'AO' },
  { name: 'Anguilla', id: 'AI' },
  { name: 'Antarctica', id: 'AQ' },
  { name: 'Argentina', id: 'AR' },
  { name: 'Armenia', id: 'AM' },
  { name: 'Aruba', id: 'AW' },
  { name: 'Australia', id: 'AU' },
  { name: 'Austria', id: 'AT' },
];

const address = {
  name: 'Tafuna Health Clinic',
  district: 'Tafuna Western District 96799,',
  country: 'American Samoa',
};

const contact = {
  name: 'Shakila Naidu',
  department: 'Ministry of Health',
  email: 'Shakila@gmail.com',
};

const GreySection = styled.section`
  background: ${COLORS.LIGHTGREY};
  box-shadow: 0 1px 0 ${COLORS.GREY_DE};
  padding: 25px 20px;
`;

const MainSection = styled.section`
  padding: 30px 20px;
`;

const WeeklyReportsPaneSubmitButton = () => {
  const handleClick = () => {
    console.log('submit...');
  };
  return (
    <Button fullWidth onClick={handleClick}>
      Submit now
    </Button>
  );
};

export const WeeklyReportPanel = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (event, isOpen) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleOpen = event => toggleDrawer(event, true);

  const handleClose = event => toggleDrawer(event, false);

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Review and Confirm Now</Button>
      <Drawer open={open} onClose={handleClose}>
        <DrawerHeader heading="Upcoming report" onClose={handleClose}>
          <DrawerHeaderContent heading="American Samoa" date="Week 9 Feb 25 - Mar 1, 2020" />
        </DrawerHeader>
        <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        <GreySection>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur laudantium non odit
          perspiciatis quidem, repellat voluptates! Architecto dolorum ducimus ea eum ipsam, iusto
          laborum nulla quam! Hic laudantium reiciendis sapiente.
        </GreySection>
        <MainSection>
          <ButtonSelect id="button-select" options={options} />
          <SiteAddress address={address} contact={contact} />
        </MainSection>
        <DrawerFooter
          Action={WeeklyReportsPaneSubmitButton}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </Drawer>
    </React.Fragment>
  );
};
