/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import moment from 'moment';

import { viewDisaster } from '../../../disaster/actions';
import { setOverlayComponent } from '../../../actions';
import { BUTTON_COLORS, BLUE, WHITE } from '../../../styles';

const styles = {
  disasterButton: {
    width: '75%',
    background: BUTTON_COLORS.primary,
    marginTop: 25,
    color: WHITE,
    fontSize: 18,
  },
};

const Container = styled.div`
  text-align: left;
`;

const Header = styled.div`
  color: ${WHITE};
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 30px;
  text-transform: uppercase;
  text-align: center;
`;

const SubHeader = styled.span`
  font-size: 18px;
  font-weight: 400;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
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

const BottomSection = styled.section`
  margin: 0 15px;
`;

const Description = styled.div`
  margin: 25px 0;
  font-weight: 300;
`;

const Resources = styled.ul`
  padding: 0 0 0 25px;
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
        <TopSection>
          <Header>{name}</Header>
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
          <Button
            variant="contained"
            style={styles.disasterButton}
            onClick={() => zoomToDisaster(selectedDisaster)}
          >
            View Disaster
          </Button>
        </TopSection>
        <hr />
        <BottomSection>
          <Description>{description}</Description>
          <div>
            <SubHeader>Resources</SubHeader>
            {renderResourceList([tupaiaResource])}
          </div>
        </BottomSection>
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
