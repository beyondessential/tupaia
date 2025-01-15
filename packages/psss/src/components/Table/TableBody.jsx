import React from 'react';
import { TableBody } from '@tupaia/ui-components';
import { SimpleTableRow, DottedTableRow, BorderlessTableRow } from './TableRow';

export const SimpleTableBody = props => <TableBody TableRow={SimpleTableRow} {...props} />;

export const BorderlessTableBody = props => <TableBody TableRow={BorderlessTableRow} {...props} />;

export const DottedTableBody = props => <TableBody TableRow={DottedTableRow} {...props} />;
