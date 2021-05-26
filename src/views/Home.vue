<template>
  <b-container fluid>
    <h2 id="ccg_name">NHS England CCGs</h2>
    <div id="map"></div>
  </b-container>
</template>

<script>
// @ is an alias to /src
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default {
  name: "Home",
  methods: {
    async init() {
      // const __VM = this;

      const source = `/data/ccg.json`;

      const data = await d3.json(source);

      console.log(data);

      d3.selectAll("#map > svg").remove();

      const svg = d3
        .select("#map")
        .append("svg")
        .attr("viewBox", [0, 0, 800, 600])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      const path = d3.geoPath();

      const transform = `
        translate(480 3920) scale(70) scale(1,-1)
      `;

      svg
        .append("path")
        .datum(topojson.mesh(data, data.objects.ccg))
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("d", path)
        .attr("vector-effect", "non-scaling-stroke")
        .attr("transform", transform);

      svg
        .append("g")
        .attr("stroke", "#000")
        .attr("transform", transform)
        .selectAll("path")
        .data(topojson.feature(data, data.objects.ccg).features)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "grey")
        /* no-unused-var */
        .on("mouseover", function (e, d) {
          d3.select(this).style("fill", "white");
          d3.select("h2#ccg_name").text(d.properties.ccg18nm);
        })
        .on("mouseout", function () {
          d3.select(this).style("fill", "grey");
          d3.select("h2#ccg_name").text("NHS England CCGs");
        });
    },
  },
  async mounted() {
    this.init();
  },
};
</script>
