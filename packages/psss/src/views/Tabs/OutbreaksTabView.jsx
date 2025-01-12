import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MuiContainer from '@material-ui/core/Container';
import { ComingSoon, Main } from '../../components';
import { OutbreaksTable /* OutbreaksPanel */ } from '../../containers';

export const OutbreaksTabView = () => {
  // eslint-disable-next-line no-unused-vars
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { countryCode } = useParams();

  return (
    <div style={{ position: 'relative' }}>
      <ComingSoon text="The Outbreaks page will show archived Alerts and Outbreaks." />
      <MuiContainer style={{ position: 'relative ' }} maxWidth="xl">
        <Main>
          <OutbreaksTable handlePanelOpen={() => setIsPanelOpen(true)} countryCode={countryCode} />
          {/* Removed for MVP release */}
          {/* <OutbreaksPanel isOpen={isPanelOpen} handleClose={() => setIsPanelOpen(false)} /> */}
        </Main>
      </MuiContainer>
    </div>
  );
};
