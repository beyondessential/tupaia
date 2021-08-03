/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Button } from '@tupaia/ui-components';
import { useVizBuilderConfig } from '../vizBuilderConfigStore';

export const SaveButton = () => {
  const [config] = useVizBuilderConfig();

  const handleSave = () => {
    alert(JSON.stringify(config, null, 2));
  };
  return <Button onClick={handleSave}>Save</Button>;
};
