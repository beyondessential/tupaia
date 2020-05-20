/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const Section = styled.section`
  background: white;
  border: 2px dashed black;
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const TableView = ({ config }) => {
  return (
    <Section>
      <Typography variant="h2" gutterBottom>
        Table View: {config.resource}
      </Typography>
    </Section>
  );
};

TableView.propTypes = {
  config: PropTypes.object.isRequired,
};
