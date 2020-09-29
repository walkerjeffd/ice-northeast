# Interactive Catchment Explorer for Stream Temperature and Brook Trout Occupancy in the Northeast U.S.

Jeffrey D Walker, PhD <jeff@walkerenvres.com>  
[Walker Environmental Research, LLC](https://walkerenvres.com)

[![DOI](https://zenodo.org/badge/161495868.svg)](https://zenodo.org/badge/latestdoi/161495868)

## About

This repository contains the source code for the Interactive Catchment Explorer (ICE) application of Stream Temperature and Brook Trout Occupancy in the Northeast U.S.

**LIVE URL:** https://usgs.gov/apps/ecosheds/ice-northeast

If you are interested in adapting ICE to other datasets, please see the ICE starter template [walkerjeffd/ice-template](https://github.com/walkerjeffd/ice-template), which contains the latest design and implementation of ICE and includes more detailed developer instructions.

## Datasets

The R and bash scripts located in the `scripts` folder are used to generate the datasets for this application, which get saved to the `data/` folder. See `scripts/README.md` for instructions. Note this requires access to the SHEDS database.

Due to their large size, the generated datasets are **not** stored in this repo. To get the latest version of the datasets, download the following tarball and extract it to the `data/` folder.

```
wget https://ecosheds.org/data/ice-northeast/ice-northeast-data.tar.gz
tar -xzvf ice-northeast-data.tar.gz -C ./data
```

## Project setup

Install dependencies

```sh
yarn install
```

Configuration is set using `.env` files for each environment (`development`, `staging`, `production`). See [vue-cli](https://cli.vuejs.org/guide/mode-and-env.html) for details.

There are two required configuration variables:

```
BASE_URL=/ # root path for the application
VUE_APP_API_URL=http://localhost:8000/  # location for fetching data, set to baseURL for axios
```

The default `.env` files can be overriden with `.local` variants (e.g. `.env.development.local`).

## Development Server

To run the application in development mode, run the `dev` command, which serves the `data/` folder at port `8000`, and runs the vue CLI `serve` command.

```sh
yarn dev
```

## Production Build

Run the `build` command to build the application for production. The output is saved to the `dist/` folder.

```sh
yarn build
```

For staging build, run `build:staging`

```sh
yarn build:staging
```

## Deployment

After building the application, copy the contents of `dist/` and `data/` to the production server.

```sh
rsync -av --delete dist/ user@host:/path/to/app
rsync -av --delete data/ user@host:/path/to/data
```

If the application is deployed to S3, use the AWS CLI.

```sh
aws s3 sync dist/ s3://<WEBSITE_BUCKET_NAME>/<BASE_URL> --delete
aws s3 sync data/ s3://<DATA_BUCKET_NAME>/ --delete
```

## License

MIT (see `LICENSE`)
