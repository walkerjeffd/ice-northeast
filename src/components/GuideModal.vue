<template>
  <div>
    <h3>Overview</h3>

    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/filter-area.gif"
          alt="Cross-filtering with percent area aggregation"
          class="img-rounded img-center pull-right">
        <p>
          The <strong>Interactive Catchment Explorer (ICE)</strong> is a data visualization tool for exploring environmental datasets and model outputs.
        </p>
        <p>ICE is designed to:</p>
        <ol>
          <li>
            Identify spatial patterns of hydro-ecological conditions over a wide range of scales,
          </li>
          <li>
            View and compare the distributions (histograms) of selected variables and regions,
          </li>
          <li>
            Use interactive cross-filtering to identify areas that meet one or more specific criteria and to discover correlations and relationships between variables.
          </li>
        </ol>
      </div>
    </div>

    <hr>

    <h3>Dataset Options</h3>
    <div class="row">
      <div class="col-md-12">
        <p>
          The dataset being shown on the map is controlled by three sets of options, which are configured using dropdown menus.
        </p>
        <p>
          The <code>Resolution</code> option determines the set of HUC boundaries that are used to spatial aggregate the individual catchments (see Spatial Aggregation below).
          Higher values correspond to the higher resolutions (HUC6 is the lowest resolution, HUC12 is the highest).
          Due to the large number of HUC12 boundaries across the North Atlantic, this resolution is divided into 2-digit HUC sub-regions, only one of which can be viewed at a time (see <a href="https://commons.wikimedia.org/wiki/File:Huc_region-edit.png" target="_blank">HUC2 map</a>).
        </p>
        <p>
          The <code>States</code> option allows you to focus on one or more states by filtering the dataset for only catchments within those states.
          For example, selecting only "Massachusetts" will filter the dataset to only include catchments located within Massachusetts.
        </p>
        <p>
          The <code>Variable</code> option determines which variable is spatially aggregated and used to color-code the HUC boundaries.
          When this variable is changed, the legend will automatically update to reflect the range of values for the selected variable.
        </p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 text-center">
        <img
          src="../assets/img/about/map-options.png"
          alt="Map options"
          class="img-rounded"
          style="margin-top:10px">
      </div>
    </div>

    <hr>

    <h3>Map Controls and Layers</h3>
    <p>
      The map provides a basemap (satellite or street map) and one or more static layers (streams, waterbodies, HUC boundaries).
      On top of the basemap and static layers is an interactive layer containing HUC boundaries for the selected resolution (e.g. HUC8, HUC10, etc.).
    </p>

    <h4>Map Controls</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/map-controls.png"
          alt="Map Controls"
          class="img-rounded pull-right">
        <p>
          Use the map controls to zoom in and out, adjust the transparency of the HUC boundaries, and switch basemaps or show/hide individual static layers.
        </p>
        <p>
          <i class="fa fa-exclamation-triangle" style="color:orange"></i> <i>The static layers (e.g. streams) are tiled images, and therefore not interactive (i.e., you cannot click on a stream to see more info).</i>
        </p>
      </div>
    </div>

    <h4>HUC Boundary Layer</h4>
    <div class="row">
      <div class="col-md-12">
        <div class="pull-right">
          <img
            src="../assets/img/about/huc-hover.png"
            alt="Hover to View HUC Info"
            class="img-rounded">
          <br>
          <img
            src="../assets/img/about/huc-click.png"
            alt="Click to Select a HUC"
            class="img-rounded"
            style="margin-top:10px">
        </div>
        <p>
          The HUC boundaries show the drainage areas of the selected resolution (see Dataset Options above).
        </p>
        <p>
          The color of each HUC boundary represents the average value of the selected variable among all catchments within that HUC (see Spatial Aggregation below).
        </p>
        <p>
          <strong>Hover</strong> your mouse over a HUC to view its ID, name, and value for the selected variable.
        </p>
        <p>
          <strong>Click</strong> to select a HUC boundary.
          This will open a new toolbar showing the name and ID of the selected HUC, and provide additional tools to view the <code>Data</code> for all variables, <code>Zoom To</code>, view <code>Catchments</code> within, or <code>Unselect</code> that HUC.
        </p>
      </div>
    </div>

    <hr>

    <h3>Color Legend</h3>

    <p>The legend shows the color scale corresponding to the range of values for the selected variable.</p>
    <p>
      Click the <code>Legend Options</code> link to open addition controls.
      The <code>Colors</code> menu provides alternative color scales.
      The <code>Transform</code> menu provides alternative variable transformations (i.e., linear or log).
      The logarithmic transformation can be useful for variables that exhibit a highly skewed distribution.
    </p>

    <img
      src="../assets/img/about/legend.png"
      alt="Legend options"
      class="img-rounded"
      style="margin-top:10px">
    <hr>

    <h3>Spatial Aggregation</h3>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/aggregation.png"
          alt="Spatial Aggregation"
          class="img-rounded pull-right">
        <p>
          One of the primary goals of ICE is to allow users to explore large geospatial datasets.
          With nearly 400,000 catchments across the North Atlantic region, it would not be possible to provide an interactive layer with all of the catchments due to the memory and processing power required.
          To solve this problem, ICE spatially aggregates the individual catchments to larger HUC* boundaries. This aggregation yields a smaller dataset (i.e., fewer polygons) that can be more efficiently displayed as an interactive layer on the map.
        </p>
        <p>
          There are two ways the catchments can be spatially aggregated to the HUC boundaries depending on which option is selected from the <code>Variable</code> dropdown menu:
        </p>
        <ul>
          <li><strong>% Area Filtered</strong>: If this option is selected, then the value for each HUC is the percent of the total area comprised of catchments that meet the filter criteria (see Histogram and Cross-filters below). For example, if a filter is set for elevation &lt; 200 m, then the value of each HUC is the percent of the total area covered by catchments with elevations less than 200 m. When no filter is set, then all HUCs will have a value of 100%.</li>
          <li><strong>Area-weighted Mean</strong>: If any of the other variables are selected, then the value for each HUC boundary is the area-weighted mean of the filtered catchments within that HUC. For example, if the selected variable is Elevation (m), then the color of each HUC reflects the area-weighted mean elevation of the catchments within it. If one or more filters are set, then this value is computed only from the catchments that meet the filter criteria.</li>
        </ul>
        <p style="font-style:italic">
          * HUC stands for <a href="https://en.wikipedia.org/wiki/Hydrological_code" target="_blank">Hydrologic Unit Code</a>, which is a hierarchical system of drainage basin classification <a href="https://water.usgs.gov/GIS/huc.html" target="_blank">developed by the USGS and USDA-NRCS</a>.
        </p>
      </div>
    </div>

    <hr>

    <h3>Histograms and Cross-filters</h3>
    <p>
      Histograms can be added on the right-hand side of the application to view the distribution of catchment values for one or more variables.
      These histograms also act as interactive filters (a process called cross-filtering), which allows you to focus on subsets of the data defined by one or more criteria.
      The cross-filters are very responsive to user inputs, allowing the user to interactively explore spatial patterns of individual variables, as well as the relationships between variables as will be explained below.
    </p>

    <h4>Histogram of All Catchments</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/histogram.png"
          alt="Select variable to view histogram"
          class="img-rounded pull-right">
        <p>
          Select one or more variables from the drop down menu to open the corresponding histogram(s).
          Each histogram shows the distribution of values for all catchments in the region (assuming no filters have been set as explained below).
          The vertical blue line shows the mean value of the distribution.
        </p>
        <p>
          <i class="fa fa-exclamation-triangle" style="color:orange"></i> <i>The histograms show the distribution of the <strong>catchments</strong>, not of the aggregated HUC values.</i>
        </p>
      </div>
    </div>

    <h4>Histogram of Selected HUC</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/histogram-selected.png"
          alt="Secondary histogram of selected HUC"
          class="img-rounded pull-right">
        <p>
          When a HUC is selected, a secondary histogram (colored orange) shows the distribution for catchments within that HUC.
          This histogram can be compared to the primary (blue) histogram to compare the catchments within this HUC relative to all catchments across the entire region.
        </p>
        <p>
          <i class="fa fa-exclamation-triangle" style="color:orange"></i> <i>The primary (blue) and secondary (orange) histograms do not share the same y-scale. They are normalized in the y-dimension so that they have the same height, but may have different maximum counts (y values).</i>
        </p>
      </div>
    </div>

    <h4>Filtering</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/filter.png"
          alt="Setting a filter"
          class="img-rounded pull-right">
        <p>
          Click and drag over a histogram to set a filter for that variable.
          This action will filter the data to a subset containing only catchments that meet the specified criteria.
          When a filter is set or changed, the spatially aggregated value of each HUC will be re-computed using only the filtered catchments.
        </p>
        <p>
          For example, if a filter is set on Elevation (m) for all values greater than 200 m, then only catchments with elevations &gt; 200 m will be used for the spatial aggregation.
          In other words, the value of each HUC will correspond to the area-weighted mean computed only from catchments with elevations &gt; 200 m.
        </p>
        <p>
          To reset (or clear) a filter, click the <code>Reset</code> link or simply click anywhere outside the current filter range on the histogram itself.
        </p>
      </div>
    </div>

    <p>
      The diagram below shows the effect of setting a filter by showing both the catchments within a selected HUC (top row), and the spatially aggregated HUC values (bottom row).
    </p>
    <img
      src="../assets/img/about/histogram-matrix.png"
      alt="Histograms with filtering and aggregation"
      class="img-rounded">

    <h4>Setting Multiple Filters</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/filter-multiple.png"
          alt="Multiple Histograms"
          class="img-rounded pull-right">
        <p>
          Multiple filters can be set simultaneously by selecting more than one variable from the dropdown menu.
          Both filters will be applied to the dataset resulting in a subset of filtered catchments that meet all of the filter criteria.
        </p>
        <p>
          For example, the screenshot on the right shows two filters being set: the first for elevation &gt; 200 m, and a second for mean summer temperature &lt; 18 degC.
          As a result, only catchments meeting both criteria are used to calculate the spatially aggregated value for each HUC.
        </p>
      </div>
    </div>

    <hr>

    <h3>Interactive Cross-filtering</h3>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/filter-catchments-animation.gif"
          alt="Animated catchment filtering"
          class="img-rounded pull-right">
        <p>
          When multiple histograms are open, setting a filter on one variable will affect the distributions of the other variables by changing the underlying dataset.
        </p>
        <p>
          The example to the right shows what happens when a filter on Elevation is dragged from low to high values, and then back again.
        </p>
        <p>
          Initially, the elevation filter is set to a range of 0-200 m.
          The map shows the filtered catchments within the selected HUC8 that have elevations in this range, which are located near the coastline as expected.
          The second histogram shows the distributions of Mean Summer Temperature based on the filtered catchments for the entire region (blue) and within the selected HUC8 (orange).
        </p>
        <p>
          As the filter range is increased, the dataset dynamically changes by adding catchments with higher elevations, and dropping those with lower elevations.
          As expected, the filtered catchments shown on the map move away from the coastline and towards higher elevations found inland.
          The second histogram shows the distributions of Mean Summer Temperature shifting from right to left (higher to lower values).
          This behavior indicates that catchments with higher elevations tend to have lower mean summer stream temperatures, and vice versa. In other words, there is an inverse relationship between elevation and stream temperature.
        </p>
      </div>
    </div>

    <hr>

    <h3>Interactive Cross-filtering at the Regional Scale</h3>
    <p>
      When using the interactive cross-filters at the regional scale (i.e. when viewing the spatially aggregated values of the HUC boundaries), we recommend starting with the
      <code>% Area Filtered</code> variable for the spatial aggregation, which is easier to interpret than the area-weighted mean of one of the other variables.
    </p>

    <h4>% Area Filtered</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/filter-area.gif"
          alt="Cross-filtering with percent area aggregation"
          class="img-rounded pull-right">
        <p>
          The example to the right shows how the % filtered area of the HUC8 boundaries varies as the mean summer stream temperature increases from low to high values and back. The second
          histogram shows the current brook trout occupancy probability.
        </p>
        <p>
          Initially, when the filter is set to a low temperature range (14-16 degC), the % area filtered is highest among the northern-most HUCs. This means that a large fraction of the catchments
          within those northern HUCs have low temperatures (and also high occupancy probabilities based on the distribution in the second histogram).
        </p>
        <p>
          As the filter is dragged to the right, the changing HUC values indicate that the areas containing the filtered catchments with higher and higher temperatures shifts south and then towards the coast.
        </p>
        <p>
          When the filter is at the highest temperature range (20-24 degC), then the HUCs in the mid-Atlantic coastline have the highest % area of filtered catchments.
        </p>
      </div>
    </div>

    <h4>Area-Weighted Mean (example: Brook Trout Occupancy)</h4>
    <div class="row">
      <div class="col-md-12">
        <img
          src="../assets/img/about/filter-bto.gif"
          alt="Cross-filtering with mean brook trout occupancy"
          class="img-rounded pull-right">
        <p>
          Interpreting changes in area-weighted mean values in response to a changing filter requires a strong understanding of how ICE works.
          For this example, Current Occupancy Prob. is the selected variable and the filter for Mean Summer Temp. (degC) is again dragged from low to high values, and back again.
        </p>
        <p>
          The changing HUC values reflect how the average occupancy probability in each HUC varies as the catchments are filtered for those with higher and higher summer temperatures (and then back).
          As expected, when the temperature filter is set to lower values, then the average occupancy probabilities are generally high among all the HUCs. As the filter is dragged to the right, the occupancy probabilities decrease due to the inverse reletionship between temperature and occupancy.
        </p>
        <p>
          This example demonstrates how to use ICE to explore how the relationship between two variables varies spatially. While the overall relationship between the two variables can seen in the
          changing histograms, changes in the spatially aggregated values among the HUCs reflect how this relationship spatially varies between all of the HUCs in the region. This approach can be useful to
          identify outliers, that is HUCs which show unique patterns relative to the other HUCs in the region.
        </p>
      </div>
    </div>

    <hr>

    <h3>Downloading Data</h3>

    <p>
      The datasets displayed in ICE can be downloaded by clicking the Download button on the main toolbar.
    </p>

    <p>
      Datasets can be downloaded in two types of file formats:
    </p>
    <ul>
      <li>
        <strong>Comma-Separate Value (CSV)</strong>: a text file containing a table of values.
        Each row repesents one geographic feature (e.g. a HUC or catchment), and each column represents an ID or variable.
        The CSV files <strong>do not</strong> include the geospatial properties (e.g. polygon) of each feature.
        CSV files can be viewed and analyzed using Excel or any other common data analysis program.
      </li>
      <li>
        <strong>GeoJSON</strong>: a text file in JSON format, which contains both an attribute table as well as the geospatial properties of each feature (i.e., the polygons).
        This file format is similar to a shapefile, but is more commonly used for web applications due to complexities of the shapefile format (e.g. each shapefile is a combination of multiple).
        GeoJSON files can be loaded directly into desktop GIS software (QGIS, or ArcGIS), or can be converted to shapefiles using the <a href="https://mygeodata.cloud/converter/geojson-to-shp" target="_blank">MyGeodata Converter</a>.
      </li>
    </ul>

    <p>The datasets that are available to download include:</p>
    <ul>
      <li>
        <strong>HUC Layer</strong>: the current set of HUC boundaries shown on the map including the ID, name, and area-weighted mean value of the selected variable.
        The GeoJSON format of this file will let you re-create the current map shown in ICE using desktop GIS software.
      </li>
      <li>
        <strong>Catchments Layer (Selected HUC Only)</strong>: when a HUC is selected, these files contain the data for either all of the catchments or only the filtered catchments within that HUC.
        In order to download the geospatial file (GeoJSON format), you must load the catchments for the HUC into ICE by clicking the Catchments button on the Selected HUC toolbar.
      </li>
      <li>
        <strong>Catchments Layer (Entire Region)</strong>: the entire dataset for the region is provided as a CSV file for either all catchments or only the filtered catchments.
        Due to the large number of catchments, the geospatial files are provided as a series of shapefiles pre-staged by 2-digit HUC regions. The CSV files can be joined to the shapefiles using the
        <code>id</code> column of the CSV file and the <code>featureid</code> column of the shapefile.
      </li>
    </ul>
  </div>
</template>

<style scoped>
img {
  margin-left: 20px;
  margin-bottom: 10px;
}
</style>
