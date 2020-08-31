import React from 'react';

export const prettyJSON = (object, space = 2) => <pre>{JSON.stringify(object, null, space)}</pre>;

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
