<template>
  <div>
    <div class="row">
      <div class="col-md-6">
        <p>
          The <strong>Interactive Catchment Explorer (ICE)</strong> is a data
          visualization tool for exploring environmental datasets and model outputs.
        </p>
        <p>ICE is designed to:</p>
        <ol>
          <li>
            Identify spatial patterns among local population patches of the individual
            covariates and vulnerability assessment risk scores for each species,
          </li>
          <li>
            View the distribution of values for each variable using histograms,
          </li>
          <li>
            Apply dynamic and interactive filters to identify which patches meet one or more
            specific criteria and to discover relationships between individual variables.
          </li>
        </ol>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/filter-animation-400x250.gif"
          alt="Filter Animation"
          class="img-rounded img-center">
      </div>
    </div>
    <hr>
    <h3>Map</h3>
    <p>
      The map shows a basemap (satellite or street map), one or more tiled layers (CCE
      boundary, basins, streams, lakes, etc.), and the local population patches for the selected
      species, which are colored according to their values for the selected variable.
    </p>
    <h4>Map Controls</h4>
    <div class="row">
      <div class="col-md-6">
        <p>
          Use the map controls to zoom in and out, adjust the transparency of the patches layer,
          and to switch basemaps or show/hide individual layers.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/map-controls-400x275.png"
          alt="Map Controls"
          class="img-rounded">
      </div>
    </div>
    <h4>Select a Patch</h4>
    <div class="row">
      <div class="col-md-6">
        <p>
          Click on a population patch to select it. This will open a new box showing the name
          and ID of the selected patch, and providing additional options to view the data for
          all variables, to zoom in to, or to unselect this patch.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/select-patch-400x200.png"
          alt="Selected Patch Options"
          class="img-rounded">
      </div>
    </div>
    <hr>
    <h3>Histograms and Filters</h3>
    <p>
      Each histogram shows the distribution of values for the population patches of the selected
      species. The histograms also act as interactive filters to identify which patches
      have values within a specific range of one or more variables.
    </p>
    <h4>View Histogram</h4>
    <div class="row">
      <div class="col-md-6">
        <p>
          Select one or more variables from the drop down menu to show the corresponding
          histogram(s). Each histogram shows the distribution of values over all patches (
          assuming no filters have been set as explained below in the Filtering with Multiple
          Histograms section). The vertical blue line shows the mean value of the distribution.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/histogram-400x250.png"
          alt="Histogram of Selected Variable"
          class="img-rounded">
      </div>
    </div>
    <h4>Set Filter</h4>
    <div class="row">
      <div class="col-md-6">
        <p>
          Click and drag over a histogram to set a filter for that variable. When a
          filter is set, the map will only show patches that have values within the range of the
          filter.
        </p>
        <p>
          For example, this screenshot shows which patches have the highest overall risk by
          setting a filter from 50 to 100 on the Overall Risk (RCP 4.5, 2035) histogram. The
          mean value has now changed from 36.6 to 63.5 because it is computed only from patches
          with values within this filtered range.
        </p>
        <p>
          To reset (or clear) a filter, click the (reset) link or simply click once anywhere
          outside the current filter range on the histogram itself.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/filter-400x248.png"
          alt="Histogram of Selected Variable"
          class="img-rounded">
      </div>
    </div>
    <h4>Filtering with Multiple Histograms</h4>
    <div class="row">
      <div class="col-md-6">
        <p>
          When more than one histogram are being shown, setting a filter on one variable will
          affect the histograms of all other variables. The histograms for these other variables
          will show the distributions based on only patches that have values within the range of
          the filter.
        </p>
        <p>
          For example, on the left no filters are set and thus both histograms show their
          distributions based on all 497 patches. But on the right, a filter has been set from
          50 to 100 for the Overall Risk Score (RCP 4.5, 2035). Because of this filter, the
          distribution (and mean) of the Historical Mean August Stream Temperature are now
          based only on the 127 (out of 497) patches that have an Overall Risk greater than 50.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/multiple-histograms-400x229.png"
          alt="Multiple Histograms"
          class="img-rounded">
      </div>
    </div>
    <h4>Applying Multiple Filters</h4>
    <div class="row">
      <div class="col-md-6">
        <p>
          Filters can be set on more than one variable to identify which patches meet
          multiple criteria simultaneously.
        </p>
        <p>
          In this example, only patches with Overall Risk (RCP 4.5, 2035) greater
          than 50 <em>AND</em> a Historical Mean August Stream Temperature greater than 10 degC
          are now being shown on the map.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/multiple-filters-400x256.png"
          alt="Multiple Filters"
          class="img-rounded">
      </div>
    </div>
    <hr>
    <h3>Dynamic Interaction</h3>
    <div class="row">
      <div class="col-md-6">
        <p>
          ICE was designed to provide a highly interactive user experience and
          thus facilitate new and exciting ways of performaing geospatial data exploration.
        </p>
        <p>
          Each filter can be dynamically dragged and resized resulting in real-time updates to
          the map and histograms of other variables as shown in the example below.
        </p>
        <p>
          By observing how changes in the filter of one variable affects the distributions of
          other variables as well as which patches appear on the map, the user can discover
          relationships between variables and apply multivariate criteria to identify specific
          patches that have certain characteristics.
        </p>
        <p>
          In this example, when the filter for Overall Risk is dragged from left to right
          to increase the range of values, the histogram for the Historical Mean August Stream
          Temperature also shifts from left to right. This indicates that patches with higher
          overall risk scores tend to have higher mean August stream temperatures and vice
          versa, as expected.
        </p>
      </div>
      <div class="col-md-6">
        <img
          src="../assets/img/about/filter-animation-400x250.gif"
          alt="Filter Animation"
          class="img-rounded">
      </div>
    </div>
    <hr>
    <h3>Development Team</h3>
    <p>
      ICE is part of the <a href="http://ecosheds.org" target="_blank">Spatial
      Hydro-Ecological Decision System (SHEDS)</a> project and is developed by:
    </p>
    <ul>
      <li>
        Dr. Jeffrey D. Walker,
        <a href="https://walkerenvres.com" target="_blank">
          Walker Environmental Research LLC
        </a>
      </li>
      <li>
        Dr. Benjamin Letcher,
        <a href="http://www.lsc.usgs.gov/?q=cafb-ben-letcher" target="_blank">
          USGS Conte Anadromous Fish Lab
        </a> and
        <a href="https://eco.umass.edu/people/faculty/letcher-ben/" target="_blank">
          UMass Amherst
        </a>
      </li>
    </ul>
    <p>
      This version of ICE was developed with funding from the
      <a href="https://www.usgs.gov/centers/norock" target="_blank">
        USGS Northern Rocky Mountain Science Center
      </a>
      to support the Vulnerability Assessment of Westslope Cutthroat Trout and Bull Trout in
      the Crown of the Continent Ecosystem.
    </p>
    <p>
      ICE was built using numerous open-source frameworks and libraries including
      <a href="https://vuejs.org" target="_blank">VueJS</a>,
      <a href="https://d3js.org" target="_blank">d3.js</a>,
      <a href="http://crossfilter.github.io/crossfilter" target="_blank">crossfilter.js</a>,
      <a href="http://leafletjs.com" target="_blank">LeafletJS</a>, and
      <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a>, among others.
    </p>
  </div>
</template>
