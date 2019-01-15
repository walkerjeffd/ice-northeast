#!/bin/bash
# copy all datasets to data directory

# catchment topojson files
echo -n Copying catchment topojson files to data/catchments/...
cp -r catchments/topojson/* ../data/catchments/
echo done

# layer topojson files
echo -n Copying layer topojson files to data/layers/...
cp layers/topojson/*.json ../data/layers/
echo done

# config file
echo -n Copying config file to data/...
cp r/config/ice-sheds.json ../data/
echo done

# dataset csv files
echo -n Copying dataset csv files to data/datasets/...
cp r/datasets/*.csv ../data/datasets/
echo done
