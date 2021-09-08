<template>
  <b-container fluid>
    <b-row>
      <b-col cols="8">
        <div id="map"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// @ is an alias to /src
import * as d3 from "d3";
import { SVG } from "@svgdotjs/svg.js";
import * as topojson from "topojson-client";
import * as OR from "../helper/overlapRemoval";

export default {
  name: "Home",
  methods: {
    async init() {
      const __VM = this;

      __VM.circle.list = [];

      d3.selectAll("#map > svg").remove();

      __VM.svg = d3
        .select("#map")
        .append("svg")
        .attr("id", "base-layer")
        .attr("viewBox", [0, 0, 800, 400])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      let svg = __VM.svg;
      svg.call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [800, 400],
          ])
          .scaleExtent([1, 6])
          .on("zoom", zoomed)
      );

      function zoomed({ transform }) {
        svg.attr("transform", transform);
      }

      // tooltip
      // eslint-disable-next-line no-unused-vars
      const tooltip = d3
        .select("#map")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("z-index", "10")
        .attr("class", "tooltip");

      const path = d3.geoPath();

      // county layer
      svg
        .append("g")
        .attr("class", "county-layer")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(__VM.county_list)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.county.color])
        .attr("county_id", (d) => d.properties.id);
      // .on("mouseover", function (e, d) {
      //   console.log(d.properties.id);
      // });

      // state layer
      svg
        .append("g")
        .attr("class", "state-layer")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(__VM.state_list)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.state.color])
        .attr("state_id", (d) => d.properties.fid);

      const colormap = d3.scaleSequential(d3.interpolatePRGn);

      // county data layer
      const rects = svg
        .append("g")
        .attr("class", "rect-layer")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(__VM.county_list)
        .enter()
        .append("rect")
        .attr("colormap", (d) => colormap(__VM.getVacRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("width", __VM.rect.size)
        .attr("height", __VM.rect.size)
        .attr("stroke", "black")
        .attr("fill", "rgb(2, 117, 216)")
        .on("mouseover", function (e, d) {
          __VM.setFill(this, "red");
          tooltip
            .style("visibility", "visible")
            .html(
              `${d.properties.NAME} <br/>Vaccination Rate: ${__VM.getVacRate(
                d
              )}%`
            );
        })
        .on("mousemove", function (e) {
          return tooltip
            .style("top", e.pageY - 20 + "px")
            .style("left", e.pageX + 20 + "px");
        })
        .on("mouseout", function () {
          __VM.setFill(this, "rgb(2, 117, 216)");
          tooltip.style("visibility", "hidden");
        });
      __VM.removeOverlap();
      // console.log(rects._groups[0]);
    },
    getVacRate(d) {
      return (
        this.indicators.find((f) => f.FIPS === d.properties.FIPS)
          .Series_Complete_Pop_Pct || 0
      );
    },
    resizeRectLayer(e) {
      const rect = SVG(e);
      rect.size(20);
    },
    setFill(e, color) {
      d3.select(e).attr("fill", color);
    },
    removeOverlap() {
      const rects = d3.selectAll(".rect-layer rect")._groups[0];

      for (let i = 0; i < 1; i++) {
        const current = rects[i];
        const next = rects[i + 1];

        console.log(current);
      }
    },
  },
  data() {
    return {
      rect: { list: [], visibility: false, color: "success", size: 1 },
      circle: { list: [], visibility: false, color: "success", size: 5 },
      state: { visibility: true, color: "danger" },
      county: { visibility: true, color: "dark" },
      colorVariant: {
        primary: "rgb(2, 117, 216)",
        info: "rgb(91, 192, 222)",
        success: "rgb(92, 184, 92)",
        warning: "rgb(240, 173, 78)",
        danger: "rgb(217, 83, 79)",
      },
    };
  },

  async mounted() {
    const __VM = this;

    __VM.indicators = (
      await d3.json(`/data/vaccination_county_condensed_data.json`)
    ).vaccination_county_condensed_data;

    __VM.shapefile = await d3.json(`/data/us_state_county.json`);

    __VM.state_list = topojson.feature(
      __VM.shapefile,
      __VM.shapefile.objects.state
    ).features;

    __VM.county_list = [];
    __VM.county_list.push(
      ...topojson
        .feature(__VM.shapefile, __VM.shapefile.objects.county)
        .features.filter(
          (e) => e.geometry && e.geometry.type && __VM.getVacRate(e) !== 0
        )
    );

    this.init();
  },
};
</script>
<style>
.tooltip {
  padding: 7px;
  background: white;
  border: 2px;
  border-style: solid;
  border-radius: 2px;
  opacity: 10 !important;
}
</style>
