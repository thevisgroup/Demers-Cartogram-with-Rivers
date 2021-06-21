<template>
  <b-container fluid>
    <b-row>
      <b-col><h2 id="state_name">US County COVID Vaccination Rate</h2></b-col>
      <b-col cols="2">
        Overlaps removed: {{ overlapsRemoved }}
        <b-button
          pill
          variant="primary"
          v-on:click="removeOverlap()"
          v-if="!overlapsRemoved"
          >Remove overlaps</b-button
        >
        <b-button
          pill
          variant="danger"
          v-on:click="init()"
          v-if="overlapsRemoved"
          >Reset overlaps</b-button
        >
      </b-col>
    </b-row>

    <div id="map"></div>
  </b-container>
</template>

<script>
// @ is an alias to /src
import * as d3 from "d3";
import * as topojson from "topojson-client";
import * as cola from "webcola";

export default {
  name: "Home",
  methods: {
    async init() {
      const __VM = this;
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
        .attr("id", "base-layer")
        .attr("viewBox", [0, 0, 1000, 800])
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
          .features.filter((e) => e.geometry && e.geometry.type),
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

      const rects = svg
        .append("g")
        .attr("id", "rect-layer")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(list)
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

      __VM.rects = rects._groups[0];

      __VM.overlapsRemoved = false;
      // __VM.removeOverlap();

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
    },
    removeOverlap() {
      const __VM = this;

      let rects = [];

      // prepare an array for webcola
      __VM.rects.forEach((r, i) => {
        r = d3.select(r);
        var x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = Number(r.attr("width")),
          h = Number(r.attr("height"));
        rects[i] = new cola.Rectangle(x, x + w, y, y + h);
      });
      // remove overlaps
      cola.removeOverlaps(rects);
      // redraw rects using new coordinates
      __VM.rects.forEach((r, i) => {
        const t = rects[i];
        d3.select(r).transition().duration(1000).attr("x", t.x).attr("y", t.y);
      });

      __VM.overlapsRemoved = true;

      d3.select("#base-layer").attr("viewBox", [0, -100, 1000, 800]);
    },
  },

  data() {
    return {
      rects: [],
      overlapsRemoved: false,
    };
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
