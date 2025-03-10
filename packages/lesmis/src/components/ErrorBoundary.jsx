import React from 'react';
import PropTypes from 'prop-types';
import { SmallAlert } from '@tupaia/ui-components';
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

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('LESMIS Error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FlexCenter p={5}>
          <SmallAlert severity="error" variant="standard">
            Something went wrong.
          </SmallAlert>
        </FlexCenter>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
