/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SmallAlert } from './Alert';
import { FlexCenter } from './Layout';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return (
        <FlexCenter p={5}>
          <SmallAlert severity="error" variant="standard">
            Something went wrong.
          </SmallAlert>
        </FlexCenter>
      );
    }

    return children;
  }
}
