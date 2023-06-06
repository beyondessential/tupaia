/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';

export const Project = () => {
  // Use these to fetch the project and any other entity info you might need
  const { projectCode, entityCode, '*': dashboardCode } = useParams();

  return (
    <div>
      <h1>Project: {projectCode}</h1>
      <h2>Entity: {entityCode}</h2>
      <h3>Dashboard: {dashboardCode}</h3>
    </div>
  );
};
