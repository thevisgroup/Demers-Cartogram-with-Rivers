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

      const source = `/data/ccg_2021.json`;

      const data = await d3.json(source);

      d3.selectAll("#map > svg").remove();

      const svg = d3
        .select("#map")
        .append("svg")
        .attr("viewBox", [0, 0, 800, 600])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      const config = { base_traslate: "scale(0.8 0.8) translate(240 480) " };

      // CCG contour layer
      const path = d3.geoPath();
      svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(topojson.feature(data, data.objects.ccg).features)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "white")
        .attr("transform", config.base_traslate);

      // centroid rectangle layer
      const rectConfig = {
        size: 10,
        color: "rgb(60, 120, 172)",
      };

      svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(topojson.feature(data, data.objects.ccg).features)
        .enter()
        .append("rect")
        .attr("transform", (d) => {
          const [x, y] = path.centroid(d);
          return `
          ${config.base_traslate}
          translate(${x},${y})
          translate(${-x - rectConfig.size / 2},${-y - rectConfig.size / 2})
          `;
        })
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("width", rectConfig.size)
        .attr("height", rectConfig.size)
        .attr("stroke", "black")
        .attr("fill", rectConfig.color)
        /* no-unused-var */
        .on("mouseover", function (e, d) {
          d3.select(this).style("fill", "red");
          d3.select("h2#ccg_name").text(d.properties.CCG21NM);
        })
        .on("mouseout", function () {
          d3.select(this).style("fill", rectConfig.color);
          d3.select("h2#ccg_name").text("NHS England CCGs");
        });
    },
  },
  async mounted() {
    this.init();
  },
};
</script>
