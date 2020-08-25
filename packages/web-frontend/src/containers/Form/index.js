/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FormError, FormSuccess, LoadingIndicator } from './common';
import { validateField } from './utils';

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 18px;
  text-align: left;
`;

export class Form extends React.Component {
  constructor(props) {
    super(props);

    this.formChildren = props.render().props.children;

    const defaultValues = {};
    React.Children.forEach(this.formChildren, child => {
      if (!child || !child.props.name) return;
      if (!React.isValidElement(child)) throw new Error('Invalid Field element as child of Form');

      const { name, defaultValue } = child.props;
      if (defaultValue !== null && defaultValue !== undefined) defaultValues[name] = defaultValue; // should allow falsy values as defaults
    });

    this.state = {
      fieldValues: { ...defaultValues },
      fieldErrors: {},
    };
  }

  updateFieldErrors = fieldProps => {
    const errors = validateField(this.state.fieldValues, fieldProps);

    if (errors.length > 0) {
      this.setState(prevState => {
        const fieldErrors = { ...prevState.fieldErrors, [fieldProps.name]: errors };
        return { fieldErrors };
      });
    }
  };

  clearFieldErrors = name => {
    this.setState(prevState => {
      const fieldErrors = { ...prevState.fieldErrors };
      delete fieldErrors[name];
      return { fieldErrors };
    });
  };

  handleChange = (target, fieldProps) => {
    const { name } = fieldProps;

    /** See full discussion of this here: https://github.com/beyondessential/tupaia-web/pull/994#discussion_r341457641
     * This logic will delete any fields with falsy values from the form entirely,
     * meaning that field will not be passed back to onSubmit.
     * This essentially means a user cannot "delete" a previously saved value.
     *
     * i.e. A user provides a bio for their account, they wouldnt be able to "delete" it later
     *      by submitting the form again with an empty field.
     *      This sort functionality doesn't currently exist in Tupaia, and the current logic is how we
     *      were previously handling Forms, so I made the decision to keep existing functionality
     *      over fixing a bug for possible future functionality.
     */
    this.setState(prevState => {
      const fieldValues = { ...prevState.fieldValues };

      if (target.type === 'checkbox') {
        if (!target.checked) {
          delete fieldValues[name];
        } else {
          fieldValues[name] = true;
        }
      } else if (!target.value) {
        delete fieldValues[name];
      } else {
        fieldValues[name] = target.value;
      }

      return { fieldValues };
    });
  };

  submitForm = event => {
    event.preventDefault();
    const fieldErrors = {};
    React.Children.forEach(this.formChildren, child => {
      if (!child || !child.props.name) return;

      const errors = validateField(this.state.fieldValues, child.props);
      if (errors.length > 0) fieldErrors[child.props.name] = errors;
    });

    if (Object.keys(fieldErrors).length > 0) this.setState({ fieldErrors });
    else this.props.onSubmit(this.state.fieldValues);
  };

  renderChildren = () => {
    return React.Children.map(this.props.render(this.submitForm).props.children, child => {
      if (child === null) return null;

      const { hidden, name } = child.props;
      if (hidden) return null;

      return React.cloneElement(child, {
        onChange: e => this.handleChange(e.target, child.props),
        onFocus: () => this.clearFieldErrors(name),
        onBlur: () => this.updateFieldErrors(child.props),
        errors: this.state.fieldErrors[name],
      });
    });
  };

  render() {
    const { isLoading, formError, formSuccess, GridComponent } = this.props;

    return (
      <form onSubmit={this.submitForm} noValidate>
        {isLoading && <LoadingIndicator />}
        <GridComponent>
          {formSuccess && <FormSuccess message={formSuccess} />}
          {this.renderChildren()}
          {formError && <FormError error={formError} />}
        </GridComponent>
      </form>
    );
  }
}

Form.propTypes = {
  formError: PropTypes.string,
  formSuccess: PropTypes.string,
  isLoading: PropTypes.bool,
  render: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  GridComponent: PropTypes.elementType,
};

Form.defaultProps = {
  isLoading: false,
  formError: null,
  formSuccess: null,
  GridComponent: FormGrid,
};
