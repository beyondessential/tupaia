import React from 'react';
import styled from 'styled-components';

const Label = styled.p`
  font-size: 13px;
`;

const SolidButton = styled.button`
  color: white;
  background: #ee612e;
  border-radius: 3px;
  border: none;
  height: 42px;
  padding: 0 29px;
  margin-right: 16px;

  :active {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #ee612e;
  }
`;

const GhostButton = styled.button`
  color: #ee612e;
  background: transparent;
  border-radius: 3px;
  border: 1px solid #ee612e;
  height: 42px;
  padding: 0 29px;

  :active {
    background: #ee612e;
    color: #ffffff;
  }
`;

const Link = styled.a`
  color: #ee612e;
  font-size: 12px;
`;

export const FluTrackingAustralia = () => (
  <>
    <hr />
    <p>
      <b>
        FluTracking is a crowd-sourced surveillance system that harnesses the power of the internet
        and community spirit for monitoring Influenza, COVID-19 and other disease issues in
        Australia and overseas. Over 140,000 people across Australia and NZ participate in
        Flutracking each week
      </b>
    </p>
    <p>
      In addition to tracking markers of Influenza across the community, since 2020, the project has
      additionally looked for markers of COVID-19 across the community.
    </p>
    <p>
      Tupaia presents mapping-led visualisations of FluTracking information using weekly data, with
      the support of the Indo-Pacific Centre for Health Security.
    </p>
    <p>FluTracking is run by the Hunter New England Local Health District.</p>
    <Label>FOR MORE INFORMATION</Label>
    <section>
      <a target="_blank" rel="noopener noreferrer" href="https://info.flutracking.net/">
        <SolidButton>More information</SolidButton>
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://info.flutracking.net/">
        <GhostButton>Join now!</GhostButton>
      </a>
    </section>
    <hr />
    <Link target="_blank" rel="noopener noreferrer" href="https://info.flutracking.net/">
      https://info.flutracking.net/
    </Link>
  </>
);
