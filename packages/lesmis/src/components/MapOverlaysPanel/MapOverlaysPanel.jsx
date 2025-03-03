import React, { useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { MapOverlayGroup } from './MapOverlayGroup';
import { MapOverlaysLoader } from './MapOverlaysLoader';
import { FlexStart } from '../Layout';
import { MapOverlaysPanelContainer as Container } from './MapOverlaysPanelContainer';
import { ErrorBoundary } from '../ErrorBoundary';
import { I18n } from '../../utils';

const Header = styled.div`
  padding: 1.25rem 1.875rem 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Body = styled.div`
  padding: 0.2rem 0 2rem;
  overflow: auto;
`;

const Box = styled(MuiBox)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  margin-left: 1rem;
`;

const searchOverlays = (result, child, path, selectedOverlay) => {
  if (!child.children) {
    if (child.mapOverlayCode === selectedOverlay) {
      return path;
    }

    return result;
  }

  return child.children.reduce(
    (nextResult, overlay, index) =>
      searchOverlays(nextResult, overlay, [...path, index], selectedOverlay),
    result,
  );
};

// Get the path to the selected overlay so that it can be highlighted with styles
const getSelectedPath = (overlays, selectedOverlay) =>
  overlays.reduce(
    (result, overlay, index) => searchOverlays(result, overlay, [index], selectedOverlay),
    null,
  );

export const MapOverlaysPanel = ({
  overlays,
  isLoadingOverlays,
  selectedOverlay,
  setSelectedOverlay,
  isLoadingData,
  YearSelector,
}) => {
  const selectedPath = useCallback(getSelectedPath(overlays, selectedOverlay), [
    overlays,
    selectedOverlay,
  ]);

  return (
    <ErrorBoundary>
      <Container>
        <Header>
          <Typography variant="h5" gutterBottom>
            <I18n t="dashboards.selectPeriod" />:
          </Typography>
          <FlexStart>
            {YearSelector}
            {/* Todo: add better loader @see https://github.com/beyondessential/tupaia-backlog/issues/2681 */}
            <Box>{isLoadingData && <CircularProgress size={30} />}</Box>
          </FlexStart>
        </Header>
        <Body>
          {isLoadingOverlays ? (
            <MapOverlaysLoader />
          ) : (
            overlays.map(({ name, children }, index) => (
              <MapOverlayGroup
                key={name}
                name={name}
                options={children}
                selectedOverlay={selectedOverlay}
                setSelectedOverlay={setSelectedOverlay}
                selectedPath={selectedPath}
                path={[index]}
              />
            ))
          )}
        </Body>
      </Container>
    </ErrorBoundary>
  );
};

MapOverlaysPanel.propTypes = {
  overlays: PropTypes.array,
  isLoadingOverlays: PropTypes.bool,
  isLoadingData: PropTypes.bool,
  selectedOverlay: PropTypes.string,
  setSelectedOverlay: PropTypes.func.isRequired,
  YearSelector: PropTypes.node.isRequired,
};

MapOverlaysPanel.defaultProps = {
  overlays: [],
  isLoadingOverlays: false,
  isLoadingData: false,
  selectedOverlay: null,
};
