Scripts for Generating ICE-SHEDS Files
======================================

## Set Up

Before running these scripts, create a config file in YAML syntax located at `scripts/config.yml`. Use the template as a starting point.

```
cp config.template.yml config.yml
nano config.yml # edit config
```

## Catchment Topojson Files

For each map feature (e.g. HUC polygon), the corresponding set of catchments within that feature are accessed from a topojson file.

To generate the topojson file for each feature at all four HUC levels (6 to 12), run the `generate-topojson.js` within the `./catchments` directory.

```
cd catchments
node generate-topojson.js
```

The output files will be saved within the `catchments/topojson/` directory and grouped by theme ID within sub-directories (e.g. `catchments/topojson/huc6/<huc6 ID>.json`).

## Layer Topojson Files

Each theme requires a layer, which is the set of features shown on the map (e.g. HUC6 polygons) and accessed as a topojson file.

Scripts to generate the HUC layer files using topojson are located in `./layers`.

```
cd layers
```

Generating the layer files requires the following steps:

1. Run `generate-shp.sh` to generate shapefiles for each of the four HUC levels (6, 8, 10, 12)
2. Run `convert-shp-topojson.js` to convert each shapefile to a topojson file (sub-setting HUC12 by HUC2 region)

### Generate Shapefile

For each HUC level (6 to 12), run `generate-shp.sh` to extract the corresponding features from the database, clip to the state boundaries, and save to a shapefile within the `layers/shp` directory.

```
./generate-shp.sh
```

### Convert Shapefiles to Topojson

For each HUC level, run `convert-shp-topojson.js` to convert the corresponding shapefile to topojson format, and save the result to the `layers/topojson` directory.

```
node convert-shp-topojson.js
```

To check topojson files, use [MapShaper](http://mapshaper.org).

Each topojson file contains an object set with the same name as the huc level (e.g. `huc6` and `huc12`). The HUC12 files DO NOT use the region in the object name, only in the filename.

## Config JSON File

The primary configuration file for ICE is generated using the `generate-config.R` script within the `./r/` directory. This can be run interactively within RStudio, or using the `RScript` command.

```
cd r
Rscript generate-config.R
```

The output config file (`ice-sheds.json`) will be saved to the `./data` folder at the root of the repository.

The output file (`ice-sheds.json`) will be saved to the `r/config/` directory.

## Dataset CSV Files

The dataset CSV file for each theme is generated from the `generate-dataset.R` script within the `./r/` directory. This can be run interactively within RStudio, or using the `RScript` command.

```
cd r
Rscript generate-dataset.R
```

The output files are saved to the `r/datasets/` directory.

## Copy to Data Directory

Run `copy_data.sh` to automatically copy all catchments, layers, datasets, and the config file to appropriate location within the `../data` directory.

```
./copy_data.sh
```
