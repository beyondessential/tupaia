import { Entity } from '/models';

export async function getRegions(req, res) {
  const { code } = req.params;
  const result = await Entity.getChildRegions(code);
  const data = {
    regions: result,
  };

  return res.send(data);
}
