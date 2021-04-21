/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledLogo = styled.div`
  width: 55px;
  height: 55px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  border: 1px solid #dedee0;
  border-radius: 5px;
`;

const LOGO_MAP = {
  AEAL: 'AEAL.jpg',
  CRS: 'CRS.jpg',
  DFAT: 'DFAT.png',
  GIZ: 'GIZ.jpg',
  HII: 'HII.png',
  Plan: 'Plan.png',
  RtR: 'RtR.jpg',
  unesco: 'unesco.jpg',
  UNICEF: 'UNICEF.png',
  VHS: 'VHS.png',
  WB: 'WB.jpg',
  WC: 'WC.png',
  WFP: 'WFP.jpeg',
  WR: 'WR.png',
  WV: 'WV.png',
};

const Logo = image => (
  <StyledLogo style={{ backgroundImage: `url('/images/partnerLogos/${image}')` }} />
);

export const getPartnerSupportItems = vitals => {
  return Object.keys(LOGO_MAP).map(partner => (vitals[partner] ? Logo(LOGO_MAP[partner]) : null));
};
