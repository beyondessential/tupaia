const getEventOrgUnitName = async (event, cache) => {
  const { orgUnit: code } = event;
  const entity = cache[CACHE_KEYS.entities].find(({ code: currentCode }) => currentCode === code);

  return entity ? entity.name : '';
};

const CACHE_KEYS = {
  entities: 'entities',
};

export const METADATA_KEYS = {
  $eventOrgUnitName: {
    getValue: getEventOrgUnitName,
    title: 'Location',
    cache: [CACHE_KEYS.entities],
  },
};

export const isMetadataKey = key => Object.keys(METADATA_KEYS).includes(key);

const assertIsMetadataKey = key => {
  if (!isMetadataKey(key)) {
    throw new Error(`Invalid metadata key: ${key}`);
  }
};

const metadataKeyToDataElement = key => {
  assertIsMetadataKey(key);

  return {
    name: METADATA_KEYS[key].title,
    id: key,
    code: key,
  };
};

export const metadataKeysToDataElementMap = (keys = []) =>
  keys.reduce((map, key) => {
    map[key] = metadataKeyToDataElement(key);
    return map;
  }, {});

class EventMetadataValueAdder {
  constructor(event, metadataKeys, cache) {
    this.event = event;
    this.metadataKeys = metadataKeys;
    this.cache = cache;
  }

  createMetadataValue = async key => {
    assertIsMetadataKey(key);
    return METADATA_KEYS[key].getValue(this.event, this.cache);
  };

  async createDataValues() {
    const metadataValues = {};

    const { dataValues } = this.event;
    const addMetadataValue = async key => {
      metadataValues[key] = await this.createMetadataValue(key);
    };
    await Promise.all(this.metadataKeys.map(addMetadataValue));

    return { ...dataValues, ...metadataValues };
  }

  async run() {
    const dataValues = await this.createDataValues();
    return { ...this.event, dataValues };
  }
}

class Cache {
  cacheKeyToMethod = {
    [CACHE_KEYS.entities]: this.getEntitiesCache.bind(this),
  };

  constructor(models, events, metadataKeys) {
    this.models = models;
    this.events = events;
    this.metadataKeys = metadataKeys;
  }

  getCacheKeys() {
    const cacheKeys = this.metadataKeys.reduce(
      (result, key) => result.concat(METADATA_KEYS[key].cache),
      [],
    );
    return [...new Set(cacheKeys)];
  }

  async getEntitiesCache() {
    const orgUnitCodes = this.events.map(({ orgUnit }) => orgUnit);
    return this.models.entity.find({ code: orgUnitCodes });
  }

  async create() {
    const cache = {};
    const addCacheForKey = async cacheKey => {
      cache[cacheKey] = await this.cacheKeyToMethod[cacheKey]();
    };
    await Promise.all(this.getCacheKeys().map(addCacheForKey));

    return cache;
  }
}

export const addMetadataToEvents = async (models, events, metadataKeys = []) => {
  if (metadataKeys.length === 0) {
    return events;
  }

  metadataKeys.map(assertIsMetadataKey);
  const cache = await new Cache(models, events, metadataKeys).create();
  return Promise.all(
    events.map(event => new EventMetadataValueAdder(event, metadataKeys, cache).run()),
  );
};
