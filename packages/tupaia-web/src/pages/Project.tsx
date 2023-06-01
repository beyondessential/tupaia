/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router-dom';

export const Project = () => {
  // Use these to fetch the project and any other entity info you might need
  const { code, entityCode } = useParams();

  return (
    <div>
      <h1>Project: {code}</h1>
      <h2>Entity: {entityCode}</h2>
    </div>
  );
};
