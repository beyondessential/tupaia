/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { useState, useEffect } from 'react';
import { FakeAPI } from './api';

export const useTableData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = new FakeAPI();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userData = await API.get('users');
      setData(userData.data);
      setLoading(false);
    })();
  }, []);

  return { loading, data };
};
