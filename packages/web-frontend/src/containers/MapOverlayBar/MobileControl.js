/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlexSpaceBetween } from '@tupaia/ui-components';
import RightArrow from '@material-ui/icons/ArrowForwardIos';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import { MAP_OVERLAY_SELECTOR } from '../../styles';
import { ExpandedContent } from './Content';

export const MOBILE_CONTROL_HEIGHT = 90;

const CollapsedContainer = styled(FlexSpaceBetween)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${MOBILE_CONTROL_HEIGHT}px;
  color: white;
  background: ${MAP_OVERLAY_SELECTOR.subBackground};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 18px;
  margin-right: 18px;
  margin-top: 18px;
  height: ${MOBILE_CONTROL_HEIGHT - 18}px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.p`
  font-size: 14px;
  font-weight: 700;
  margin: 0;
`;

const LoadingSpinner = styled(CircularProgress)`
  color: white;
  margin-left: 10px;
`;

const SelectedLabel = styled.div`
  display: flex;
  flex: 1;
  margin-left: 18px;
  font-weight: 500;
  align-items: center;
  font-size: 12px;
`;

const SelectedText = styled.span`
  margin-left: 11px;
`;

const EmptyText = styled.span``;

const RightArrowIconWrapper = styled.div`
  padding: 0 14px 0 5px;
`;

const LibraryContainer = styled.div`
  height: 100%;
`;

const Library = ({ children, onClose }) => (
  <LibraryContainer onClick={onClose}>
    <ExpandedContent>{children}</ExpandedContent>
  </LibraryContainer>
);

const MobileControlComponent = ({
  emptyMessage,
  selectedMapOverlays,
  children,
  isMeasureLoading,
}) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const selectedMapOverlay = selectedMapOverlays?.length > 0 ? selectedMapOverlays[0] : null;
  const hasChildren = !!children;

  const openLibrary = useCallback(() => setIsLibraryOpen(true), []);
  const closeLibrary = useCallback(() => setIsLibraryOpen(false), []);

  if (isLibraryOpen && hasChildren) {
    return <Library onClose={closeLibrary}>{children}</Library>;
  }
  return (
    <CollapsedContainer onClick={openLibrary}>
      <Content>
        <TitleContainer>
          <Title>Map Overlay</Title>
          {isMeasureLoading && <LoadingSpinner size={16} />}
        </TitleContainer>
        <SelectedLabel>
          {selectedMapOverlay ? (
            <>
              <RadioButtonCheckedIcon fontSize="inherit" />
              <SelectedText>{selectedMapOverlay.name}</SelectedText>
            </>
          ) : (
            <EmptyText>{emptyMessage}</EmptyText>
          )}
        </SelectedLabel>
      </Content>
      {selectedMapOverlay && (
        <RightArrowIconWrapper>
          <RightArrow />
        </RightArrowIconWrapper>
      )}
    </CollapsedContainer>
  );
};

MobileControlComponent.propTypes = {
  selectedMapOverlays: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      periodGranularity: PropTypes.string,
      isTimePeriodEditable: PropTypes.bool,
      datePickerLimits: PropTypes.shape({
        startDate: PropTypes.object,
        endDate: PropTypes.object,
      }),
      startDate: PropTypes.shape({}),
      endDate: PropTypes.shape({}),
    }),
  ),
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  isMeasureLoading: PropTypes.bool.isRequired,
};

MobileControlComponent.defaultProps = {
  selectedMapOverlays: [],
  children: null,
};

const mapStateToProps = state => {
  const { isMeasureLoading } = state.map;
  const { isLoadingOrganisationUnit } = state.global;
  return { isMeasureLoading: isMeasureLoading || isLoadingOrganisationUnit };
};

export const MobileControl = connect(mapStateToProps)(MobileControlComponent);
