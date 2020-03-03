import { Entity } from '/models';

export async function getRegions(req, res) {
  const { code } = req.params;
  const parent = await Entity.findOne({ code });
  const regions = await parent.getChildRegions();
  const data = { regions };

  return res.send(data);
}
