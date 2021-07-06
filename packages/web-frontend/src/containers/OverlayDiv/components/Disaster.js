/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MuiButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import moment from 'moment';
import { viewDisaster } from '../../../disaster/actions';
import { setOverlayComponent } from '../../../actions';
import { BUTTON_COLORS, BLUE } from '../../../styles';

const Container = styled.div`
  padding: 2.5rem 3.5rem;
  text-align: left;
  max-width: 700px;
`;

const Heading = styled(Typography)`
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 2rem;
`;

const SubHeading = styled.span`
  font-size: 18px;
  font-weight: 400;
`;

const InfoList = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 25px;
  grid-auto-flow: column;
`;

const InfoListKey = styled.div`
  font-weight: 400;
  text-transform: uppercase;
`;

const InfoListValue = styled.div`
  font-weight: 300;
`;

const Description = styled.div`
  margin: 25px 0;
  font-weight: 300;
`;

const Resources = styled.ul`
  padding: 0 0 0 25px;
`;

const Button = styled(MuiButton)`
  background: ${BUTTON_COLORS.primary};
  margin-bottom: 25px;
  font-size: 18px;
`;

const ResourceLink = styled.a`
  color: ${BLUE};
  white-space: nowrap;
  outline: none;
  text-decoration: underline;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
`;

const renderResourceList = resources => {
  return (
    <Resources>
      {resources.map(resource => (
        <li key={resource.url}>
          <ResourceLink target="_blank" href={resource.url}>
            {resource.title}
          </ResourceLink>
        </li>
      ))}
    </Resources>
  );
};

class Disaster extends Component {
  render() {
    const {
      selectedDisaster,
      selectedDisaster: {
        name,
        type,
        status,
        location,
        startDate,
        endDate,
        description,
        countryCode,
      },
      zoomToDisaster,
    } = this.props;
    const start = !startDate ? status : moment(startDate).format('DD-MM-YYYY h:mma');
    const end = moment(endDate).isValid() ? moment(endDate).format('DD-MM-YYYY h:mma') : 'N/A';

    /**
     * TODO: Implement external resources attached to disasters
     * in DB in the SAME STRUCTURE as the below tupaiaResource object.
     * Then combine them with tupaiaResource (ensuring tupaiaResource always comes first)
     *
     * i.e. const resources = [tupaiaResource, ...selectedDisaster.resources];
     */
    const tupaiaResource = {
      title: `${location} Disaster Response Information`,
      url: 'https://sdd.spc.int/disasters-data',
    };

    return (
      <Container>
        <Heading variant="h2">{name}</Heading>
        <InfoList>
          <div>
            <InfoListKey>type:</InfoListKey>
            <InfoListValue>{type}</InfoListValue>
          </div>
          <div>
            <InfoListKey>status:</InfoListKey>
            <InfoListValue>{status}</InfoListValue>
          </div>
          <div>
            <InfoListKey>location:</InfoListKey>
            <InfoListValue>{location}</InfoListValue>
          </div>
          <div>
            <InfoListKey>start:</InfoListKey>
            <InfoListValue>{start}</InfoListValue>
          </div>
          <div>
            <InfoListKey>end:</InfoListKey>
            <InfoListValue>{end}</InfoListValue>
          </div>
        </InfoList>
        <Description>{description}</Description>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => zoomToDisaster(selectedDisaster)}
        >
          View Disaster
        </Button>
        <div>
          <SubHeading>Resources</SubHeading>
          {renderResourceList([tupaiaResource])}
        </div>
      </Container>
    );
  }
}

Disaster.propTypes = {
  selectedDisaster: PropTypes.shape({}),
};

const mapStateToProps = state => {
  const { selectedDisaster } = state.disaster;
  return { selectedDisaster };
};

const mapDispatchToProps = dispatch => ({
  zoomToDisaster: d => {
    dispatch(setOverlayComponent(null));
    dispatch(viewDisaster(d));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Disaster);
