import React from 'react';
import { connect } from 'react-redux';

const ExampleWithReduxComponent = ({ counter, increment }) => (
  <div>
    ExampleWithRedux: {`${counter} `}
    <button type="button" onClick={increment}>
      ++
    </button>
  </div>
);

const mapStateToProps = state => ({ counter: state.example.counter });
const mapDispatchToProps = dispatch => ({
  increment: () => dispatch({ type: 'INCREMENT' }),
});

export const ExampleWithRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExampleWithReduxComponent);
