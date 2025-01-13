import React, { Component, ReactNode } from 'react';
import { SmallAlert } from './Alert';
import { FlexCenter } from './Layout';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    const { children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return (
        <FlexCenter p={5}>
          <SmallAlert severity="error">Something went wrong</SmallAlert>
        </FlexCenter>
      );
    }

    return children;
  }
}
