<template>
  <b-container fluid>
    <b-row>
      <b-col cols="9">
        <div id="map"></div>
      </b-col>
      <b-col cols="3">
        <div class="table-responsive option_table">
          <table
            class="
              table table-bordered table-striped table-hover table-borderless
            "
          >
            <thead>
              <tr>
                <th>Feature</th>
                <th>Visibility</th>
                <th>Option</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Rectangle</th>
                <td>
                  <b-button
                    block
                    :variant="(rect.visibility ? '' : 'outline-') + rect.color"
                    v-on:click="toggleFeatureVisibility('rect')"
                    >Rectangle</b-button
                  >
                </td>
                <td>
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
                </td>
              </tr>
              <tr>
                <th scope="row">River</th>
                <td>
                  <b-button
                    block
                    :variant="
                      (river.visibility ? '' : 'outline-') + river.color
                    "
                    v-on:click="toggleFeatureVisibility('river')"
                    >River</b-button
                  >
                </td>
              </tr>
              <tr>
                <th scope="row">County</th>
                <td>
                  <b-button
                    block
                    :variant="
                      (county.visibility ? '' : 'outline-') + county.color
                    "
                    v-on:click="toggleFeatureVisibility('county')"
                    >County</b-button
                  >
                </td>
                <td></td>
              </tr>
              <tr>
                <th scope="row">State</th>
                <td>
                  <b-button
                    block
                    :variant="
                      (state.visibility ? '' : 'outline-') + state.color
                    "
                    v-on:click="toggleFeatureVisibility('state')"
                    >State</b-button
                  >
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-col>
    </b-row>

    <footer class="footer">
      <div class="container">
        <span
          >US County COVID Vaccination Rate. Source: https://www.cdc.gov/.</span
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
  name: "Home",
  methods: {
    async init() {
      const __VM = this;
      const shapefile = await d3.json(`/data/us_state_county.json`);

      // eslint-disable-next-line no-unused-vars
      const indicators = (
        await d3.json(`/data/vaccination_county_condensed_data.json`)
      ).vaccination_county_condensed_data;

      // eslint-disable-next-line no-unused-vars
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
        .attr("viewBox", [0, 0, 800, 400])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

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

      const list = [];

      list.push(
        ...topojson
          .feature(shapefile, shapefile.objects.county)
          .features.filter((e) => e.geometry && e.geometry.type)
      );

      // county layer
      svg
        .append("g")
        .attr("id", "county-layer")
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
        .attr("id", "state-layer")
        .datum(topojson.mesh(shapefile, shapefile.objects.state))
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.state.color])
        .attr("d", path);

      // county data layer
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
        .attr("fill", __VM.colorVariant[__VM.rect.color])
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
          d3.select(this).style("fill", __VM.colorVariant[__VM.rect.color]);
          tooltip.style("visibility", "hidden");
        });

      // river layer
      svg
        .append("path")
        .attr("id", "river-layer")
        .datum(topojson.mesh(shapefile, shapefile.objects.mississippi_river))
        .attr("stroke-width", "5px")
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.river.color])
        .attr("d", path);

      __VM.rects = rects._groups[0];

      __VM.overlapsRemoved = false;
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
        d3.select(r).transition().duration(10000).attr("x", t.x).attr("y", t.y);
      });

      __VM.overlapsRemoved = true;

      d3.select("#base-layer").attr("viewBox", [-100, -100, 1200, 700]);
    },
    toggleFeatureVisibility(type) {
      const __VM = this;
      __VM[type].visibility = !__VM[type].visibility;
      d3.select(`#${type}-layer`).style(
        "visibility",
        __VM[type].visibility ? "visible" : "hidden"
      );
    },
  },

  data() {
    return {
      rects: [],
      overlapsRemoved: false,
      rect: { visibility: true, color: "success", size: 10 },
      river: { visibility: true, color: "info" },
      state: { visibility: true, color: "danger" },
      county: { visibility: true, color: "dark" },
      colorVariant: {
        primary: "	rgb(2, 117, 216)",
        info: "rgb(91, 192, 222)",
        success: "rgb(92, 184, 92)",
        warning: "rgb(240, 173, 78)",
        danger: "rgb(217, 83, 79)",
        dark: "rgb(41, 43, 44)",
      },
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
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  line-height: 60px;
  background-color: #f5f5f5;
}
</style>
