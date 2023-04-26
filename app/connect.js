const { Client } = require('pg');
const util = require('util');

const connectionString = {
  user: 'user_one', host: 'localhost', database: 'China', password: 'user_one', port: 5432
};

async function getGeoPathJsonString() {
  const client = new Client(connectionString);

  client.connect();

  const queryPromise = util.promisify(client.query).bind(client);
  const result = await queryPromise('SELECT ST_AsGeoJSON(geom) as json, * FROM path');

  // Створити GeoJSON-файл з потрібною структурою
  const geojson = {
    type: 'FeatureCollection',
    features: []
  };
  result.rows.forEach(row => {
    if (row.json != null) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: "MultiLineString",
          coordinates: (JSON.parse(row.json)).coordinates
        },
        properties: {}
      };
      geojson.features.push(feature);
    }
  });

  const geoPathJSONString = JSON.stringify(geojson);

  client.end();

  return geoPathJSONString;
}

async function getGeoCenterJSONString() {
  const client = new Client(connectionString);

  client.connect();

  const queryPromise = util.promisify(client.query).bind(client);
  const result = await queryPromise('SELECT ST_AsGeoJSON(geom) as json, * FROM center');

  // Створити GeoJSON-файл з потрібною структурою
  const geojson = {
    type: 'FeatureCollection',
    features: []
  };
  result.rows.forEach(row => {
    if (row.json != null) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: "Point",
          coordinates: (JSON.parse(row.json)).coordinates
        },
        properties: {
          id: row.id
        }
      };
      geojson.features.push(feature);
    }
  });

  const geoCenterJSONString = JSON.stringify(geojson);

  client.end();

  return geoCenterJSONString;
}

async function getGeoMapJSONString() {
  const client = new Client(connectionString);

  client.connect();

  const queryPromise = util.promisify(client.query).bind(client);
  const result = await queryPromise('SELECT ST_AsGeoJSON(geog) as json, * FROM map');

  // Створити GeoJSON-файл з потрібною структурою
  const geojson = {
    type: 'FeatureCollection',
    features: []
  };
  result.rows.forEach(row => {
    if (row.json != null) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: "MultiPolygon",
          coordinates: (JSON.parse(row.json)).coordinates
        },
        properties: {
          id: row.gid
        }
      };
      geojson.features.push(feature);
    }
  });

  const geoMapJSONString = JSON.stringify(geojson);

  client.end();

  return geoMapJSONString;
}

async function getGeoCellsJSONString() {
  const client = new Client(connectionString);

  client.connect();

  const queryPromise = util.promisify(client.query).bind(client);
  const result = await queryPromise('SELECT ST_AsGeoJSON(geom) as json, * FROM cells');

  // Створити GeoJSON-файл з потрібною структурою
  const geojson = {
    type: 'FeatureCollection',
    features: []
  };
  result.rows.forEach(row => {
    if (row.json != null) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: "Polygon",
          coordinates: (JSON.parse(row.json)).coordinates
        },
        properties: {
          id: row.id, 
          info: row.cell_info
        }
      };
      geojson.features.push(feature);
    }
  });

  const geoCellsJSONString = JSON.stringify(geojson);

  client.end();

  return geoCellsJSONString;
}

async function findPath(vertexIdList){
  const client = new Client(connectionString);

  client.connect();

  const queryPromise = util.promisify(client.query).bind(client);
  await queryPromise('TRUNCATE TABLE path;');
  await queryPromise('SELECT shortest_path_multi($1::integer[]);', [vertexIdList]);
  const result = await queryPromise('UPDATE path SET geom = (SELECT geom FROM roads WHERE path.edge = roads.gid);');
  await queryPromise('UPDATE path SET cost = (SELECT cost FROM roads WHERE path.edge = roads.gid);');
  await queryPromise('UPDATE path SET full_cost = (SELECT SUM(cost) FROM path);');

  client.end();

  if (result.rowCount == 0) {
    return false;
  }

  return true;
}

async function findCells(region, cellSize) {
  const client = new Client(connectionString);

  client.connect();

  const queryPromise = util.promisify(client.query).bind(client);
  await queryPromise('TRUNCATE TABLE cells;');
  await queryPromise('INSERT INTO cells (geom, cell_info) SELECT cell_geom, cell_info FROM cell_polygon_geom((SELECT geog FROM map WHERE gid = $1), \'info\', $2)', [region, cellSize]);

  client.end();

  return true;
}

async function getPathDistance() {
  try {
    const client = new Client(connectionString);

    client.connect();

    const queryPromise = util.promisify(client.query).bind(client);
    const result = await queryPromise('SELECT full_cost/1000 as full_cost FROM path');

    await client.end();

    return result.rows[0].full_cost;

  } catch (err) {
    throw new Error('Failed to get path distance');
  }
}


module.exports = { getGeoPathJsonString, getGeoCenterJSONString, findPath, findCells, getPathDistance, getGeoMapJSONString, getGeoCellsJSONString };
