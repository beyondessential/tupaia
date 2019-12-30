export const getUser = () => (req, res) => {
  const { userName, email } = req.session.userJson;
  res.send({ name: userName, email });
};
