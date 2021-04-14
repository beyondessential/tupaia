/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MeasureGroup } from './MeasureGroup';
import { Loader } from './Loader';
import { MeasurePanelContainer as Container } from './MeasurePanelContainer';

const Body = styled.div`
  padding: 0.2rem 0 2rem;
`;

export const MeasurePanel = ({ measures, isLoading, measureId, setMeasureId }) => {
  const [selectedPath, setSelectedPath] = useState([0]); // assume the first item is selected. Can I calculate this?
  return (
    <Container>
      <Body>
        {isLoading ? (
          <Loader />
        ) : (
          measures.map(({ name, children }, index) => (
            <MeasureGroup
              key={name}
              name={name}
              options={children}
              value={measureId}
              setValue={setMeasureId}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              path={[index]}
            />
          ))
        )}
      </Body>
    </Container>
  );
};

MeasurePanel.propTypes = {
  measures: PropTypes.array,
  isLoading: PropTypes.bool,
  measureId: PropTypes.string.isRequired,
  setMeasureId: PropTypes.func.isRequired,
};

MeasurePanel.defaultProps = {
  measures: [],
  isLoading: false,
};
