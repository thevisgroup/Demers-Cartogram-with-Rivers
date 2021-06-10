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
      const shapefile = await d3.json(`/data/ccg_2020.json`);
      const indicators = await d3.json(`/data/cardiovascular_00754.json`);

      const calculateRectSize = (d) => {
        const current = indicators[d.properties.id].Person.value;
        const { range, min } = indicators.metadata.Person.value;
        return (Math.abs(current - min) / range) * 15;
      };

      d3.selectAll("#map > svg").remove();

      const svg = d3
        .select("#map")
        .append("svg")
        .attr("viewBox", [0, 0, 800, 600])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      const config = { base_traslate: "" };

      // CCG contour layer
      const path = d3.geoPath();
      svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(topojson.feature(shapefile, shapefile.objects.ccg).features)
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
        .data(topojson.feature(shapefile, shapefile.objects.ccg).features)
        .enter()
        .append("rect")
        .attr("transform", (d) => {
          const [x, y] = path.centroid(d);
          return `
          ${config.base_traslate}
          translate(${x},${y})
          translate(${-x - calculateRectSize(d) / 2},${
            -y - calculateRectSize(d) / 2
          })
          `;
        })
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
    },
  },
  async mounted() {
    this.init();
  },
};
</script>
