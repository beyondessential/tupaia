/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Link } from '@material-ui/core';
import { PageContainer, PageTitleBar, ReportsIcon } from '../components';
import { Reports } from '../features';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding-top: 1.5rem;
  }
`;

const Container = styled(Paper).attrs({
  elevation: 0,
})`
  width: 100%;
  max-width: 38rem;
  padding: 1rem;
  border-radius: 0.625rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1.81rem 3.12rem;
  }
`;

const InlineLink = styled(Link)`
  text-decoration: underline;
`;

const Text = styled(Typography)`
  line-height: 1.56;
`;

export const ReportsPage = () => {
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
