/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Button } from '@tupaia/ui-components';
import { useStore } from '../store';

export const SaveButton = () => {
  const [config] = useStore();

  const handleSave = () => {
    alert(JSON.stringify(config, null, 2));
  };
  return <Button onClick={handleSave}>Save</Button>;
};
