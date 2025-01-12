import { useState, useEffect } from 'react';
import { FakeAPI } from '../stories/story-utils/api';

export const useTableData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = new FakeAPI();

  useEffect(() => {
    let isCurrent = true;
    (async () => {
      setLoading(true);
      const userData = await API.get('users');
      if (isCurrent) {
        setData(userData.data);
        setLoading(false);
      }
    })();
    return () => {
      isCurrent = false;
    };
  }, []);

  return { loading, data };
};
