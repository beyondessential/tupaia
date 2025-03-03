import PropTypes from 'prop-types';

export const DefaultValueType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.bool,
  PropTypes.instanceOf(Date),
  PropTypes.array,
]);

export const ParameterType = {
  id: PropTypes.string,
  name: PropTypes.string,
  config: PropTypes.shape({
    type: PropTypes.string,
    hasDefaultValue: PropTypes.bool,
    defaultValue: DefaultValueType,
  }),
};

export const ParametersType = PropTypes.arrayOf(PropTypes.shape(ParameterType));
