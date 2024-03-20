export const getUser = () => (req, res) => {
  const { userName, email } = req.userJson;
  res.send({ name: userName, email });
};
