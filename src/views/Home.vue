<template>
  <b-container fluid>
    <h2 id="state_name">US County COVID Vaccination Rate</h2>
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
      const shapefile = await d3.json(`/data/us_state_county.json`);
      // eslint-disable-next-line no-unused-vars
      const indicators = (
        await d3.json(`/data/vaccination_county_condensed_data.json`)
      ).vaccination_county_condensed_data;

      const calculateRectSize = (d) => {
        return getVacRate(d) * 0.2;
      };

      const getVacRate = (d) => {
        const county = indicators.find((f) => f.FIPS === d.properties.FIPS);

        return county ? county.Series_Complete_Pop_Pct : 0;
      };

      d3.selectAll("#map > svg").remove();

      const svg = d3
        .select("#map")
        .append("svg")
        .attr("viewBox", [0, 0, 800, 600])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      // tooltip
      const tooltip = d3
        .select("#map")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .attr("class", "tooltip");

      // county layer
      const path = d3.geoPath();

      const list = [];

      list.push(
        ...topojson
          .feature(shapefile, shapefile.objects.county)
          .features.filter(
            // eslint-disable-next-line no-prototype-builtins
            (e) => e.geometry && e.geometry.hasOwnProperty("type")
          ),
        ...topojson.feature(shapefile, shapefile.objects.alaska).features,
        ...topojson.feature(shapefile, shapefile.objects.alaska2).features
      );

      svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(list)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "white");

      // state layer

      svg
        .append("path")
        .datum(topojson.mesh(shapefile, shapefile.objects.state))
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("d", path);

      // county data layer
      const rectConfig = {
        size: 10,
        color: "rgb(60, 120, 172)",
      };

      // svg
      //   .append("g")
      //   .attr("fill", "white")
      //   .attr("stroke", "none")
      //   .selectAll("path")
      //   .data(topojson.feature(shapefile, shapefile.objects.state).features)
      //   .join("path")
      //   .attr("vector-effect", "non-scaling-stroke")
      //   .attr("d", path)
      //   .on("mouseover", function (e, d) {
      //     console.log(d);
      //     d3.select(this).style("fill", "red");
      //     d3.select("h2#state_name").text(d.properties.NAME);
      //   })
      //   .on("mouseout", function () {
      //     d3.select(this).style("fill", rectConfig.color);
      //     d3.select("h2#state_name").text("US State & County Map");
      //   });

      svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(list)
        .enter()
        .append("rect")
        .attr("transform", (d) => {
          const [x, y] = path.centroid(d);
          return `
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
          tooltip
            .style("visibility", "visible")
            .html(
              `${d.properties.NAME} <br/>Vaccination Rate: ${getVacRate(d)}%`
            );
        })
        .on("mousemove", function (e) {
          return tooltip
            .style("top", e.pageY - 20 + "px")
            .style("left", e.pageX + 20 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).style("fill", rectConfig.color);
          tooltip.style("visibility", "hidden");
        });
    },
  },
  async mounted() {
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
