/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PageContainer, PageTitleBar, ReportsIcon } from '../../components';
import { ReportsForm } from './ReportsForm';

export const ReportsPage = () => {
  return (
    <PageContainer>
      <PageTitleBar title="Reports" Icon={ReportsIcon} isTransparent />
      <ReportsForm />
    </PageContainer>
  );
};
