/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Collapse,
  Nav,
  Navbar as RSNavbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from 'reactstrap';

/**
 * Renders a basic navbar, with the brand name on the left and a series of links
 * @prop {string} brandName The name to display on the left of the navbar
 * @prop {array}  leftLinks An array of objects defining 'path' and 'label' for each link on left
 * @prop {array}  leftLinks An array of objects defining 'path' and 'label' for each link on right
 */
export class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  renderNavItem(link) {
    const { onNavigate, activeLinkPath } = this.props;
    return (
      <NavItem key={link.label}>
        <NavLink
          active={activeLinkPath === link.path}
          href={'#'}
          onClick={link.onClick || (() => onNavigate(link.path))}
        >
          {link.label}
        </NavLink>
      </NavItem>
    );
  }

  render() {
    const { brandName, leftLinks, rightLinks, onNavigate } = this.props;
    return (
      <div>
        <RSNavbar light expand={'md'}>
          <NavbarBrand href={'#'} onClick={() => onNavigate('/home')}>
            {brandName}
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav navbar>{leftLinks.map(link => this.renderNavItem(link))}</Nav>
            <Nav className={'ml-auto'} navbar>
              {rightLinks.map(link => this.renderNavItem(link))}
            </Nav>
          </Collapse>
        </RSNavbar>
      </div>
    );
  }
}

Navbar.propTypes = {
  brandName: PropTypes.string,
  leftLinks: PropTypes.array,
  rightLinks: PropTypes.array,
  onNavigate: PropTypes.func.isRequired,
  activeLinkPath: PropTypes.string,
};

Navbar.defaultProps = {
  brandName: '',
  leftLinks: [],
  rightLinks: [],
  activeLinkPath: '',
};
