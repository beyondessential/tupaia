import React from 'react';
import { connect } from 'react-redux';
import { example } from '../store/example';

const ExampleWithReduxComponent = ({ counter, increment1, increment2 }) => (
  <div>
    ExampleWithRedux: {`${counter} `}
    <button type="button" onClick={increment1}>
      ++1
    </button>
    <button type="button" onClick={increment2}>
      ++2
    </button>
  </div>
);

const mapStateToProps = state => ({ counter: state.example.counter });
const mapDispatchToProps = dispatch => ({
  increment1: () => dispatch({ type: 'INCREMENT' }),
  increment2: () => dispatch(example()),
});

export const ExampleWithRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExampleWithReduxComponent);
