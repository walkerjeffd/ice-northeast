#!/bin/bash
# Generate HUC layers as shapefiles
# - for each huc level (6, 8, 10, 12)
#   - fetch HUC10 features excluding estuaries
#   - merge HUC10 features to specified HUC level (to avoid coastal issues)
#   - clip to state boundary
#   - save to shapefile
# usage: ./generate-shp.sh
# example: ./generate-shp.sh 6  # -> huc6.shp

HUC_LEVELS="6 8 10 12"

for HUC_LEVEL in $HUC_LEVELS; do
  FILENAME=shp/huc${HUC_LEVEL}.shp

  SNAP_FACTOR=0.0000001

  SQL_BOUNDARY="
  SELECT ST_Union(ST_SnapToGrid(geom, ${SNAP_FACTOR})) AS geom
  FROM gis.states
  WHERE stusps IN ('ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC', 'WV', 'VA')
  "

  SQL_HUC10="
    SELECT name, huc10, geom
    FROM gis.wbdhu10
    WHERE (
      substring(huc10, 1, 2) IN ('01', '02')
      OR
      substring(huc10, 1, 4) IN ('0301', '0304', '0411', '0412', '0413', '0414', '0415', '0501', '0502', '0503', '0505', '0507', '0509', '0601')
    )
    AND (
      substring(huc10, 1, 8) NOT IN ('04150200', '04120200', '02030203', '02040204', '02060001', '02080101')
    )
    AND (huc10 NOT IN ('0207001110'))
  "

  if [ ${HUC_LEVEL} = "10" ]; then
    SQL="
      WITH boundary AS (
        ${SQL_BOUNDARY}
      ), huc10 AS (
        ${SQL_HUC10}
      ), t1 AS (
        SELECT
          ST_SnapToGrid(huc10.geom, ${SNAP_FACTOR}) as geom,
          huc10
        FROM huc10
      ), t2 AS (
        SELECT
          ST_Intersection(t1.geom, boundary.geom) as geom,
          huc10
        FROM t1, boundary
      )
      SELECT ST_SetSRID(t2.geom, 4326), t2.huc10, w.name
      FROM t2
      LEFT JOIN gis.wbdhu10 w
      ON t2.huc10 = w.huc10
    "
  elif [ ${HUC_LEVEL} = "12" ]; then
    SQL="
      WITH huc10 AS (
        ${SQL_HUC10}
      ), boundary AS (
        ${SQL_BOUNDARY}
      )
      SELECT
        ST_SetSRID(ST_Intersection(w.geom, boundary.geom), 4326),
        huc12,
        name
      FROM wbdhu12 w, boundary
      WHERE substr(huc12, 1, 10) IN (SELECT huc10 FROM huc10)
    "
  else
    SQL="
      WITH boundary AS (
        ${SQL_BOUNDARY}
      ), huc10 AS (
        ${SQL_HUC10}
      ), t1 AS (
        SELECT
          ST_Union(ST_SnapToGrid(huc10.geom, ${SNAP_FACTOR})) as geom,
          substring(huc10, 1, ${HUC_LEVEL}) AS huc${HUC_LEVEL}
        FROM huc10
        GROUP BY huc${HUC_LEVEL}
      ), t2 AS (
        SELECT
          ST_Intersection(t1.geom, boundary.geom) as geom,
          huc${HUC_LEVEL}
        FROM t1, boundary
      )
      SELECT ST_SetSRID(t2.geom, 4326), t2.huc${HUC_LEVEL}, w.name
      FROM t2
      LEFT JOIN gis.wbdhu${HUC_LEVEL} w
      ON t2.huc${HUC_LEVEL} = w.huc${HUC_LEVEL}
    "
  fi

  echo -n generating ${FILENAME}...
  ogr2ogr -f "ESRI Shapefile" ${FILENAME} PG:"host=ecosheds.org dbname=sheds" -sql "$SQL"
  echo done

done
