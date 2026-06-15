import { expect } from 'chai';
import { isEntityUnchanged } from '../../../../apiV2/import/importEntities/isEntityUnchanged';

// The stored state shape produced by loadExistingEntities.
const existing = {
  name: 'Pangoe',
  type: 'village',
  country_code: 'SB',
  parent_code: 'SB',
  image_url: null,
  longitude: 160.5,
  latitude: -9.4,
  attributes: { area_type: 'island' },
  data_service_config: null,
  entity_polygon_id: null,
};

// A re-exported row that matches `existing` exactly.
const matchingRow = {
  name: 'Pangoe',
  entity_type: 'village',
  country_code: 'SB',
  parent_code: 'SB',
  image_url: '',
  longitude: 160.5,
  latitude: -9.4,
  attributes: { area_type: 'island' },
};

describe('isEntityUnchanged', () => {
  it('returns false for a new entity (no existing row)', () => {
    expect(isEntityUnchanged(matchingRow, undefined)).to.equal(false);
  });

  it('returns true when nothing changed', () => {
    expect(isEntityUnchanged(matchingRow, existing)).to.equal(true);
  });

  it('detects changes to the simple columns', () => {
    expect(isEntityUnchanged({ ...matchingRow, name: 'Renamed' }, existing)).to.equal(false);
    expect(isEntityUnchanged({ ...matchingRow, entity_type: 'facility' }, existing)).to.equal(false);
    expect(isEntityUnchanged({ ...matchingRow, country_code: 'KI' }, existing)).to.equal(false);
    expect(isEntityUnchanged({ ...matchingRow, parent_code: 'SB_district' }, existing)).to.equal(
      false,
    );
    expect(isEntityUnchanged({ ...matchingRow, image_url: 'x.png' }, existing)).to.equal(false);
  });

  it('compares coordinates only when the row supplies them', () => {
    expect(isEntityUnchanged({ ...matchingRow, latitude: -9.5 }, existing)).to.equal(false);
    // No coordinates in the row → importer leaves the point untouched → unchanged.
    const { longitude, latitude, ...noCoords } = matchingRow;
    expect(isEntityUnchanged(noCoords, existing)).to.equal(true);
  });

  it('compares attributes only when supplied, and treats true/"true" as equal', () => {
    expect(
      isEntityUnchanged({ ...matchingRow, attributes: { area_type: 'maritime' } }, existing),
    ).to.equal(false);
    // Row omits attributes → importer leaves them untouched → unchanged.
    const { attributes, ...noAttributes } = matchingRow;
    expect(isEntityUnchanged(noAttributes, existing)).to.equal(true);
    // Stored boolean vs imported string "true" — equal, so no churn on round-trip.
    expect(
      isEntityUnchanged(
        { ...matchingRow, attributes: { area_type: 'island', is_active: 'true' } },
        { ...existing, attributes: { area_type: 'island', is_active: true } },
      ),
    ).to.equal(true);
  });

  it('detects data_service_entity changes when supplied', () => {
    expect(
      isEntityUnchanged(
        { ...matchingRow, data_service_entity: { kobo_id: '1' } },
        { ...existing, data_service_config: { kobo_id: '2' } },
      ),
    ).to.equal(false);
    expect(
      isEntityUnchanged(
        { ...matchingRow, data_service_entity: { kobo_id: '1' } },
        { ...existing, data_service_config: { kobo_id: '1' } },
      ),
    ).to.equal(true);
  });

  it('handles the polygon link conservatively', () => {
    // Matching id (rest equal) → unchanged.
    expect(
      isEntityUnchanged(
        { ...matchingRow, entity_polygon_id: 'poly1' },
        { ...existing, entity_polygon_id: 'poly1' },
      ),
    ).to.equal(true);
    expect(
      isEntityUnchanged(
        { ...matchingRow, entity_polygon_id: 'poly2' },
        { ...existing, entity_polygon_id: 'poly1' },
      ),
    ).to.equal(false);
    // A natural-key polygon ref can't be cheaply resolved here → treat as changed.
    expect(
      isEntityUnchanged({ ...matchingRow, entity_polygon_code: 'PW_vil_052' }, existing),
    ).to.equal(false);
    // screen_bounds present → treat as changed.
    expect(isEntityUnchanged({ ...matchingRow, screen_bounds: '[[1,2],[3,4]]' }, existing)).to.equal(
      false,
    );
  });
});
