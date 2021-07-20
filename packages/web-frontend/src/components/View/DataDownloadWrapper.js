/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * DataDownloadWrapper
 *
 * Renders view with single export link from data provided by viewContent object. It will first
 * open a dialog to select dates, and request the url with start and end date appended
 * @prop {object} viewContent An object with the following structure
   {
    "viewType": "export",
    "name": "Basic Clinic Data",
    "value:  "https://config.tupaia.org/api/v1/export/surveyResponses?surveyCode=BCD&organisationUnitCode=TO"
  }
 * @return {React Component} a view with one export link
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CheckboxIcon from '@material-ui/icons/CheckBox';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';

import { VIEW_STYLES, OFF_WHITE } from '../../styles';
import { VIEW_CONTENT_SHAPE } from '.';
import { getAbsoluteApiRequestUri } from '../../utils/request';

export class DataDownloadWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedSurveys: {},
    };
  }

  getDownloadLink = () => {
    const { viewContent } = this.props;
    const selectedSurveyCodes = Object.entries(this.state.selectedSurveys)
      .filter(([, isSelected]) => isSelected)
      .map(([surveyCode]) => surveyCode);
    return getAbsoluteApiRequestUri(`${viewContent.downloadUrl}&surveyCodes=${selectedSurveyCodes}`);
  };

  toggleSelection = surveyCode =>
    this.setState(prevState => ({
      selectedSurveys: {
        ...prevState.selectedSurveys,
        [surveyCode]: !prevState.selectedSurveys[surveyCode],
      },
    }));

  renderBody = () => {
    const { viewContent, onClose } = this.props;
    const { data } = viewContent;
    return (
      <div>
        <div style={styles.formContainer}>
          <FormControl>
            <FormGroup>
              {data.map(({ value: surveyCode, name: surveyName }) => (
                <FormControlLabel
                  key={surveyCode}
                  control={
                    <Checkbox
                      checked={this.state.selectedSurveys[surveyCode]}
                      checkedIcon={<CheckboxIcon style={styles.checkbox} />}
                      onChange={() => this.toggleSelection(surveyCode)}
                      value={surveyCode}
                    />
                  }
                  label={surveyName}
                />
              ))}
            </FormGroup>
          </FormControl>
        </div>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="primary"
            href={this.getDownloadLink()}
            variant="contained"
            download
            disabled={Object.values(this.state.selectedSurveys).every(isSelected => !isSelected)}
          >
            Download
          </Button>
        </DialogActions>
      </div>
    );
  };

  renderPlaceholder = () => {
    const { viewContent } = this.props;
    return viewContent.data.map(({ name: surveyName, value: surveyCode }) => (
      <span key={surveyCode} style={{ ...VIEW_STYLES.downloadLink, color: OFF_WHITE }}>
        {surveyName}
      </span>
    ));
  };

  render = () => {
    const { isEnlarged } = this.props;
    return (
      <div style={VIEW_STYLES.viewContainer}>
        {isEnlarged ? this.renderBody() : this.renderPlaceholder()}
      </div>
    );
  };
}

DataDownloadWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  isEnlarged: PropTypes.bool,
  onClose: PropTypes.func,
};

DataDownloadWrapper.defaultProps = {
  isEnlarged: false,
  onClose: () => {},
};

const styles = {
  checkbox: {
    color: OFF_WHITE,
  },
  formContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0px 40px 30px 40px',
  },
};
