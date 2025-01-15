import React from 'react';

export const prettyArray = array =>
  array ? (
    <ul>
      {array.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    ''
  );
