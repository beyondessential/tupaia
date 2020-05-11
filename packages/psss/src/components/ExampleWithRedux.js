import React from 'react';
import { connect } from 'react-redux';

const ExampleWithReduxComponent = ({ counter, dispatch }) => (
  <div>
    ExampleWithRedux: {`${counter} `}
    <button type="button" onClick={() => dispatch({ type: 'INCREMENT' })}>
      ++
    </button>
  </div>
);

const mapStateToProps = state => ({ counter: state.example.counter });

export const ExampleWithRedux = connect(mapStateToProps)(ExampleWithReduxComponent);
