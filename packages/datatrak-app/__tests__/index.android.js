import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

// Note: test renderer must be required after react-native.
import Index from '../index.android.js';

it('renders correctly', () => {
  const tree = renderer.create(<Index />);
});
