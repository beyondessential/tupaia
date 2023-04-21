/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  List as MuiList,
  ListItem,
  ListItemText,
  MenuItem,
  Menu,
  Typography,
} from '@material-ui/core';
import DropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { WHITE } from '../styles';

const List = styled(MuiList)`
  color: ${WHITE};
`;

export class DropDownMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.handleOpenMenu = this.handleOpenMenu.bind(this);
    this.handleCloseMenu = this.handleCloseMenu.bind(this);
    this.handleChangeSelection = this.handleChangeSelection.bind(this);
  }

  handleOpenMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleCloseMenu() {
    this.setState({ anchorEl: null });
  }

  handleChangeSelection(newSelectedOptionIndex) {
    this.handleCloseMenu();
    this.props.onChange(newSelectedOptionIndex);
  }

  renderListComponent() {
    const {
      title,
      options,
      selectedOptionIndex,
      iconStyle,
      StyledPrimaryComponent,
      disableGutters,
    } = this.props;
    const PrimaryComponent = StyledPrimaryComponent || Typography;
    const primaryTitle = title || options[selectedOptionIndex];

    return (
      <List component="nav">
        <ListItem disableGutters={disableGutters} onClick={this.handleOpenMenu} button>
          <ListItemText primary={<PrimaryComponent>{primaryTitle}</PrimaryComponent>} />
          {options.length > 1 && <DropDownIcon style={iconStyle} />}
        </ListItem>
      </List>
    );
  }

  renderMenuComponent() {
    const { options, selectedOptionIndex, menuListStyle, anchorOrigin, StyledOptionComponent } =
      this.props;
    const { anchorEl } = this.state;
    const OptionComponent = StyledOptionComponent || Typography;

    return options.length > 1 ? (
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={anchorOrigin}
        onClose={this.handleCloseMenu}
        MenuListProps={{ style: menuListStyle }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            onClick={() => this.handleChangeSelection(index)}
            selected={index === selectedOptionIndex}
          >
            <OptionComponent>{option}</OptionComponent>
          </MenuItem>
        ))}
      </Menu>
    ) : null;
  }

  render() {
    return (
      <div>
        {this.renderListComponent()}
        {this.renderMenuComponent()}
      </div>
    );
  }
}

DropDownMenu.propTypes = {
  title: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedOptionIndex: PropTypes.number.isRequired,
  iconStyle: PropTypes.object,
  disableGutters: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  menuListStyle: PropTypes.object,
  anchorOrigin: PropTypes.object,
  StyledPrimaryComponent: PropTypes.object,
  StyledOptionComponent: PropTypes.object,
};

DropDownMenu.defaultProps = {
  title: '',
  iconStyle: {},
  disableGutters: false,
  menuListStyle: {},
  anchorOrigin: {},
  StyledPrimaryComponent: null,
  StyledOptionComponent: null,
};
