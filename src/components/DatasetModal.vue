<template>
  <div>
    <h4>Catchment Delineation and Basin Characteristics</h4>
    <p>Source: <a href="https://ecosheds.github.io/necd/" target="_blank">Northeast Catchment Delineation (NECD)</a></p>

    <table class="table table-condensed table-striped">
      <thead>
        <th>Variable</th>
        <th>Description</th>
        <th>Source</th>
      </thead>
      <tbody>
        <tr>
          <td>Drainage Area (km2)</td>
          <td>Total (cumulative) drainage area of each catchment</td>
          <td>SHEDS Delineation (NHDHRDV2)</td>
        </tr>
        <tr>
          <td>Elevation (m)</td>
          <td>Average elevation of each catchment</td>
          <td>National Elevation Dataset (NED)</td>
        </tr>
        <tr>
          <td>Agriculture Cover (%)</td>
          <td>Percent of agriculture land use within catchment</td>
          <td>National Land Cover Database</td>
        </tr>
        <tr>
          <td>Forest Cover (%)</td>
          <td>Percent of forest cover within catchment</td>
          <td>National Land Cover Database</td>
        </tr>
        <tr>
          <td>Summer Precip. (mm/mon)</td>
          <td>Average summer (Jun-Aug) precipitation within catchment</td>
          <td>PRISM Climate Group</td>
        </tr>
      </tbody>
    </table>

    <hr>

    <h4>Stream Temperature Model</h4>
    <p>Source: <a href="http://ecosheds.org/models/stream-temperature/v1.3.0/" target="_blank">Northeast Stream Temperature Model (v1.3.0)</a></p>

    <table class="table table-condensed table-striped">
      <thead>
        <th>Variable</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr>
          <td>Mean Summer Temp. (degC)</td>
          <td>Predicted mean summer (Jun-Aug) stream temperature at catchment outlet</td>
        </tr>
        <tr>
          <td>Mean Summer Temp. (degC) w/ Air Temp +2 degC</td>
          <td>Predicted mean summer (Jun-Aug) stream temperature at catchment outlet with air temperature increase of +2 degC</td>
        </tr>
        <tr>
          <td>Mean Summer Temp. (degC) w/ Air Temp +4 degC</td>
          <td>Predicted mean summer (Jun-Aug) stream temperature at catchment outlet with air temperature increase of +4 degC</td>
        </tr>
        <tr>
          <td>Mean Summer Temp. (degC) w/ Air Temp +6 degC</td>
          <td>Predicted mean summer (Jun-Aug) stream temperature at catchment outlet with air temperature increase of +6 degC</td>
        </tr>
        <tr>
          <td># Days/Year Temp. &gt; 18 degC</td>
          <td>Frequency (days per year) with predicted mean daily stream temp &gt; 18 degC at catchment outlet</td>
        </tr>
        <tr>
          <td># Days/Year Temp. &gt; 22 degC</td>
          <td>Frequency (days per year) with predicted mean daily stream temp &gt; 22 degC at catchment outlet</td>
        </tr>
      </tbody>
    </table>

    <hr>

    <h4>Brook Trout Occupancy Model</h4>
    <p>Source: <a href="http://ecosheds.org/models/brook-trout-occupancy/v1.4.0/" target="_blank">Northeast Brook Trout Occupancy Model (v1.4.0)</a></p>

    <table class="table table-condensed table-striped">
      <thead>
        <th>Variable</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr>
          <td>Current Occupancy Prob.</td>
          <td>Predicted probability of Brook Trout occupancy within catchment under current (historical) conditions</td>
        </tr>
        <tr>
          <td>Occupancy Prob. w/ Air Temp +2 degC</td>
          <td>Predicted probability of Brook Trout occupancy within catchment with 2 degC increase in air temp.</td>
        </tr>
        <tr>
          <td>Occupancy Prob. w/ Air Temp +4 degC</td>
          <td>Predicted probability of Brook Trout occupancy within catchment with 4 degC increase in air temp.</td>
        </tr>
        <tr>
          <td>Occupancy Prob. w/ Air Temp +6 degC</td>
          <td>Predicted probability of Brook Trout occupancy within catchment with 6 degC increase in air temp.</td>
        </tr>
        <tr>
          <td>Max Air Temp Increase for 30% Occupancy Prob.</td>
          <td>Maximum increase in air temperature yielding a 30% probability of Brook Trout occupancy.</td>
        </tr>
        <tr>
          <td>Max Air Temp Increase for 50% Occupancy Prob.</td>
          <td>Maximum increase in air temperature yielding a 50% probability of Brook Trout occupancy.</td>
        </tr>
        <tr>
          <td>Max Air Temp Increase for 70% Occupancy Prob.</td>
          <td>Maximum increase in air temperature yielding a 70% probability of Brook Trout occupancy.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
