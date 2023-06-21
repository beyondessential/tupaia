/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DesktopLayout } from './DesktopLayout';
import { MobileTabLayout } from './MobileTabLayout';

/**
 * This is the layout for the project/* view. This contains the map and the sidebar, as well as any overlays that are not auth overlays (i.e. not needed in landing pages)
 */
export const ProjectPage = () => {
  // Use these to fetch the project and any other entity info you might need
  // const { projectCode, entityCode, '*': dashboardCode } = useParams();

  return (
    <>
      <MobileTabLayout />
      <DesktopLayout />
      {/** This is where SessionExpiredDialog and any other overlays would go, as well as loading screen */}
    </>
  );
};
