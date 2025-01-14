import React from 'react';
import { DesktopLayout } from './DesktopLayout';
import { MobileTabLayout } from './MobileTabLayout';

/**
 * This is the layout for the project/* view. This contains the map and the sidebar, as well as any overlays that are not auth overlays (i.e. not needed in landing pages)
 */
export const ProjectPage = () => {
  return (
    <>
      <MobileTabLayout />
      <DesktopLayout />
    </>
  );
};
