import { fetchFromCentralServer } from "../appServer/requestHelpers";


export const editDashboard = async (req, res) => {
  const endpoint = 'dashboard';
  const payload = req.body;
  console.log('editDashboard', payload)
  const x = await fetchFromCentralServer(endpoint, payload);
  console.log('cs done');
  res.send({ message: 'Done' });
};