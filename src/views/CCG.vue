<template>
  <b-container fluid>
    <h2 id="ccg_name">NHS England CCGs (2020)</h2>
    <svg
      id="base-layer"
      viewBox="0,0,800,600"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <rect width="100%" height="100%" fill="none" pointer-events="all"></rect>
      <g id="map"></g>
    </svg>

    <footer class="footer" style="width: 98%">
      <div class="container">
        <span
          >England CCG cardiovascular prevalence in 2020. Source:
          https://digital.nhs.uk/.</span
        >
      </div>
    </footer>
  </b-container>
</template>

<script>
// @ is an alias to /src
import * as d3 from "d3";
import * as topojson from "topojson-client";
import * as cola from "webcola";

export default {
  name: "CCG",
  methods: {
    async init() {
      const __VM = this;

      const ccg_shapefile = await d3.json(`/data/ccg.json`);
      const river_shapefile = await d3.json(`/data/river.json`);
      const indicators = await d3.json(`/data/cardiovascular_00754.json`);

      const calculateRectSize = (d) => {
        const current = indicators[d.properties.id].Person.value;
        const { range, min } = indicators.metadata.Person.value;
        return (Math.abs(current - min) / range) * 15;
      };

      d3.selectAll("#map").remove();

      __VM.svg = d3.select("#base-layer").append("g").attr("id", "map");

      d3.select("#base-layer").call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [1000, 800],
          ])
          .scaleExtent([1, 15])
          .on("zoom", zoomed)
      );

      __VM.svg = d3
        .select("#map")
        .append("svg")
        .attr("viewBox", [0, 0, 1000, 800])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      function zoomed(event) {
        const { transform } = event;
        d3.select("#map").attr("transform", transform);
        d3.select("#map").attr("stroke-width", 1 / transform.k);

        __VM.zoom = transform;
      }

      // avoid resetting zoom level
      if (__VM.zoom) {
        d3.select("#map").attr("transform", __VM.zoom);
        d3.select("#map").attr("stroke-width", 1 / __VM.zoom.k);
      }
      const config = { base_traslate: "" };

      const path = d3.geoPath();

      // centroid rectangle layer
      const rectConfig = {
        size: 10,
        color: "rgb(60, 120, 172)",
      };

      // CCG layer
      __VM.svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(
          topojson.feature(ccg_shapefile, ccg_shapefile.objects.ccg).features
        )
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "white")
        .attr("transform", config.base_traslate);

      // river layer
      __VM.svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(
          topojson.feature(river_shapefile, river_shapefile.objects.river)
            .features
        )
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "red")
        .attr("transform", config.base_traslate);

      const rects = __VM.svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(
          topojson.feature(ccg_shapefile, ccg_shapefile.objects.ccg).features
        )
        .enter()
        .append("rect")
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("width", (d) => calculateRectSize(d))
        .attr("height", (d) => calculateRectSize(d))
        .attr("stroke", "black")
        .attr("fill", rectConfig.color)
        /* no-unused-var */
        .on("mouseover", function (e, d) {
          d3.select(this).style("fill", "red");
          d3.select("h2#ccg_name").text(d.properties.name);
          calculateRectSize(d);
        })
        .on("mouseout", function () {
          d3.select(this).style("fill", rectConfig.color);
          d3.select("h2#ccg_name").text("NHS England CCGs");
        });

      __VM.rect.list = rects._groups[0];

      __VM.removeOverlap();
    },
    removeOverlap() {
      const __VM = this;

      let rects = [];

      // prepare an array for webcola
      const prepareColaRect = (r, i) => {
        r = d3.select(r);
        var x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = Number(r.attr("width")),
          h = Number(r.attr("height"));
        rects[i] = new cola.Rectangle(x, x + w, y, y + h);
      };

      __VM.rect.list.forEach((r, i) => {
        prepareColaRect(r, i);
      });

      // remove overlaps
      cola.removeOverlaps(rects);

      // redraw rects using new coordinates
      const redrawD3Rect = (r, i) => {
        const t = rects[i];
        d3.select(r).transition().duration(1000).attr("x", t.x).attr("y", t.y);
      };

      __VM.rect.list.forEach((r, i) => redrawD3Rect(r, i));
    },
  },
  data() {
    return {
      rect: { list: [] },
      svg: {},
    };
  },
  async mounted() {
    this.init();
  },
};
</script>
