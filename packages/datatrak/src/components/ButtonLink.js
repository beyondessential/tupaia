/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';

export const ButtonLink = props => <Button component={RouterLink} {...props} />;
