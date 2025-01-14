import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Link } from '@material-ui/core';
import { Button, PageContainer, PageTitleBar, ReportsIcon, Modal } from '../components';
import { Reports } from '../features';
import { useIsMobile } from '../utils';
import { useNavigate } from 'react-router-dom';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block-start: 1.5rem;
`;

const Container = styled(Paper).attrs({
  elevation: 0,
})`
  inline-size: 100%;
  max-inline-size: 38rem;
  border-radius: 0.625rem;
  padding: 1.81rem 3.12rem;
`;

const InlineLink = styled(Link)`
  text-decoration: underline;
`;

const Text = styled(Typography)`
  line-height: 1.56;
`;

const MobileContainer = styled(Paper).attrs({
  elevation: 0,
})`
  text-align: center;
  max-width: 19rem;
  padding: 0.5rem 0 0;

  h1.MuiTypography-root {
    margin-block-end: 1rem;
  }
  p.MuiTypography-root {
    margin-block-end: 1.5rem;
  }
  a.MuiButtonBase-root {
    width: 100%;
  }
`;

const MobileTemplate = () => {
  const navigate = useNavigate();
  const onClose = () => navigate('/');
  return (
    <Modal open={true} onClose={onClose}>
      <MobileContainer>
        <Typography variant="h1">Reports not available on mobile</Typography>
        <Typography>
          The reports feature is only available on desktop. Please visit Tupaia DataTrak on desktop
          to proceed.
        </Typography>
        <Button to="/">Close</Button>
      </MobileContainer>
    </Modal>
  );
};

export const ReportsPage = () => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <MobileTemplate />;
  }

  return (
    <PageContainer>
      <PageTitleBar title="Reports" Icon={ReportsIcon} isTransparent />
      <Wrapper>
        <Container>
          <Text>
            Download a raw data excel file to complete your own analysis. If the desired report is
            not available, please contact{' '}
            <InlineLink href="mailto:support@tupaia.org" color="textPrimary">
              support@tupaia.org
            </InlineLink>
            .
          </Text>
          <Reports />
        </Container>
      </Wrapper>
    </PageContainer>
  );
};
