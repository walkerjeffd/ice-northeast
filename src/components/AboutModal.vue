<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/guide/filter-area.gif"
          alt="Cross-filtering with percent area aggregation"
          class="img-rounded img-center pull-right"
          style="padding:0px 0px 20px 20px;">
        <p>
          Welcome to the Interactive Catchment Explorer (ICE), a web-based data visualization tool for <strong>exploring</strong> complex, multivariate environmental datasets and model results. It is designed to help researchers and resource managers <strong>identify spatial patterns</strong> in hydro-ecological conditions and to <strong>prioritize locations</strong> for restoration or further study.
        </p>
        <p>
          This application contains the following datasets and models:
        </p>
        <ul>
          <li>
            <a href="https://ecosheds.github.io/necd/" target="_blank">Northeast Catchment Delineation</a>: a custom, high resolution catchment delineation and basin characteristics dataset of the Northeast U.S.
          </li>
          <li>
            <a href="https://ecosheds.github.io/northeast-temp-model/" target="_blank">Northeast Stream Temperature Model</a>: a hierarchical Bayesian model for predicting daily mean stream temperature using observed data from the <a href="http://db.ecosheds.org/" target="_blank">Northeast Stream Temperature Database</a>.
          </li>
          <li>
            <a href="https://ecosheds.github.io/northeast-bto-model/" target="_blank">Northeast Brook Trout Occupancy Model</a>: a logistic mixed-effects model for predicting the probability of Brook Trout occupancy based on predicted stream temperatures under historical and potential climate change scenarios.
          </li>
        </ul>

        <p>More information about the datasets and models can be found by clicking the <strong>Datasets</strong> button on the upperleft toolbar.</p>

        <p style="border:1px solid red;border-radius:5px;padding: 5px; background: #eee">
          <strong style="color:red">Disclaimer</strong>: The models used in this project were designed to capture large-scale, regional patterns in stream temperature and brook trout occupancy. Although results can be viewed at the local catchment scale, the accuracy of these models can vary widely from catchment to catchment depending on the amount of available local data and other factors. Please use caution when interpreting the results at local spatial scales.
        </p>

        <p>
          <strong>Other Versions:</strong> ICE has been adapted for a variety of other datasets and models around the country. Other versions of ICE can be found at <a href="https://usgs.gov/apps/ecosheds">https://usgs.gov/apps/ecosheds</a>.
        </p>
        <p>
          <strong>Citation:</strong> Walker JD, Letcher BH, Rodgers KD, Muhlfeld CC, D'Angelo VS (2020). An Interactive Data Visualization Framework for Exploring Geospatial Environmental Datasets and Model Predictions. Water 12(10):2928. <a href="https://doi.org/10.3390/w12102928" target="_blank">https://doi.org/10.3390/w12102928</a>
        </p>
        <p>
          <strong>Team:</strong> ICE is part of the <a href="https://usgs.gov/apps/ecosheds" target="_blank">EcoSHEDS</a> project and was developed by <a href="https://walkerenvres.com" target="_blank">Dr. Jeffrey D. Walker</a> (Contractor to USGS, Walker Environmental Research) and <a href="https://www.usgs.gov/staff-profiles/benjamin-h-letcher" target="_blank">Dr. Benjamin Letcher</a> (USGS, Eastern Ecological Science Center).
        </p>
        <p>
          <strong>Funding:</strong> This project was funded by the <a href="https://necsc.umass.edu/" target="_blank">NE Climate Science Center</a>, <a href="http://northatlanticlcc.org/" target="_blank">North Atlantic Landscape Conservation Cooperative</a>, <a href="http://www.usgs.gov/hurricane/sandy/#overview.html" target="_blank">USGS and DOI Hurricane Sandy Restoration funds</a>, and the <a href="https://nccwsc.usgs.gov/" target="_blank">USGS National Climate Science Center</a>.
        </p>
      </div>
    </div>
  </div>
</template>
