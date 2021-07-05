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
                <th>Feature Visibility</th>
                <th>User Options</th>
              </tr>
            </thead>
            <tbody>
              <tr>
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
                    variant="primary"
                    v-on:click="removeOverlap()"
                    v-if="!overlapsRemoved"
                    >Remove overlaps</b-button
                  >
                  <b-button
                    variant="danger"
                    v-on:click="init()"
                    v-if="overlapsRemoved"
                    >Reset overlaps</b-button
                  >

                  <b-button
                    variant="primary"
                    v-on:click="setRectSize(true)"
                    v-if="!rectSizeUniformed"
                    >Uniform Size</b-button
                  >

                  <b-button
                    variant="danger"
                    v-on:click="setRectSize(false)"
                    v-if="rectSizeUniformed"
                    >Variable Size</b-button
                  >

                  <b-button
                    variant="primary"
                    v-on:click="setRectColor()"
                    v-if="rectMapToColor"
                    >Map to Size</b-button
                  >

                  <b-button
                    variant="danger"
                    v-on:click="setRectColor()"
                    v-if="!rectMapToColor"
                    >Map to Color</b-button
                  >
                </td>
              </tr>
              <tr>
                <td>
                  <b-button
                    block
                    :variant="
                      (river.visibility ? '' : 'outline-') + river.color
                    "
                    v-on:click="toggleFeatureVisibility('river')"
                    >River</b-button
                  >
                  <b-button-group size="sm">
                    <b-button
                      v-for="river in getRivers"
                      :key="river.name"
                      :variant="
                        (river.visibility ? '' : 'outline-') + river.color
                      "
                      v-on:click="toggleFeatureVisibility('river', river.color)"
                      >{{ river.name }}</b-button
                    >
                  </b-button-group>
                </td>
                <td></td>
              </tr>
              <tr>
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

    <footer class="footer" style="width: 98%">
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
        .attr("class", "county-layer")
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
        .attr("class", "state-layer")
        .datum(topojson.mesh(shapefile, shapefile.objects.state))
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.state.color])
        .attr("d", path);

      const colormap = d3.scaleSequential(d3.interpolatePRGn);

      // county data layer
      const rects = svg
        .append("g")
        .attr("class", "rect-layer")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(list)
        .enter()
        .append("rect")
        .attr("colormap", (d) => colormap(getVacRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("width", (d) => calculateRectSize(d))
        .attr("height", (d) => calculateRectSize(d))
        .attr("stroke", "black")
        .attr("fill", __VM.colorVariant[__VM.rect.color])
        /* no-unused-var */
        .on("mouseover", function (e, d) {
          d3.select(this).attr("fill", "red");
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
          __VM.setRectColor(this);
          tooltip.style("visibility", "hidden");
        });

      // missouri river layer
      svg
        .append("path")
        .attr("class", "river-layer missouri")
        .datum(topojson.mesh(shapefile, shapefile.objects.missouri))
        .attr("stroke-width", "5px")
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.river.rivers.missouri.color])
        .attr("d", path);

      // mississippi river layer
      svg
        .append("path")
        .attr("class", "river-layer mississippi")
        .datum(topojson.mesh(shapefile, shapefile.objects.mississippi))
        .attr("stroke-width", "5px")
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.river.rivers.mississippi.color])
        .attr("d", path);

      // rio grande river layer
      svg
        .append("path")
        .attr("class", "river-layer rio_grande")
        .datum(topojson.mesh(shapefile, shapefile.objects.rio_grande))
        .attr("stroke-width", "5px")
        .attr("fill", "none")
        .attr("stroke", __VM.colorVariant[__VM.river.rivers.rio_grande.color])
        .attr("d", path);

      __VM.rect.list = rects._groups[0];

      __VM.rectSizeUniformed = false;
      __VM.overlapsRemoved = false;
    },
    removeOverlap() {
      const __VM = this;

      let rects = [];

      // prepare an array for webcola
      const prepareColaRect = (r, i) => {
        r = d3.select(r);
        var x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = Number(__VM.rectSizeUniformed ? 10 : r.attr("width")),
          h = Number(__VM.rectSizeUniformed ? 10 : r.attr("height"));
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

      __VM.overlapsRemoved = true;

      d3.select("#base-layer").attr("viewBox", [-150, -100, 1200, 700]);
    },
    toggleFeatureVisibility(type, name = false) {
      const __VM = this;
      if (name) {
        __VM[type].rivers[name].visibility =
          !__VM[type].rivers[name].visibility;
        d3.select(`.${type}-layer.${name}`).style(
          "visibility",
          __VM[type].rivers[name].visibility ? "visible" : "hidden"
        );
      } else {
        __VM[type].visibility = !__VM[type].visibility;

        Object.values(__VM[type].rivers).forEach(
          (r) => (r.visibility = __VM[type].visibility)
        );
        d3.selectAll(`.${type}-layer`).style(
          "visibility",
          __VM[type].visibility ? "visible" : "hidden"
        );
      }
    },
    async setRectSize(uniformRectSize) {
      const __VM = this;
      __VM.rectSizeUniformed = uniformRectSize;
      if (uniformRectSize) {
        d3.selectAll("#rect-layer > rect").attr(
          "style",
          "width: 10px !important; height: 10px !important;"
        );

        if (__VM.overlapsRemoved) {
          __VM.removeOverlap();
          d3.select("#base-layer").attr("viewBox", [-400, -150, 1800, 700]);
        }
      } else {
        if (__VM.overlapsRemoved) {
          await __VM.init();
          __VM.removeOverlap();
        }

        d3.selectAll("#rect-layer > rect").attr("style", "");
      }
    },
    setRectColor(singleRect) {
      const __VM = this;
      const changeColor = (r, color) => {
        d3.select(r).attr("fill", color);
      };

      if (__VM.rectMapToColor) {
        if (singleRect) {
          changeColor(singleRect, d3.select(singleRect).attr("colormap"));
        } else {
          d3.selectAll("#rect-layer > rect")._groups[0].forEach((r) => {
            changeColor(r, __VM.colorVariant[__VM.rect.color]);
          });

          __VM.rectMapToColor = false;
        }
      } else {
        if (singleRect) {
          changeColor(singleRect, __VM.colorVariant[__VM.rect.color]);
        } else {
          d3.selectAll("#rect-layer > rect")._groups[0].forEach((r) => {
            const colormap = d3.select(r).attr("colormap");
            changeColor(r, colormap);
          });

          __VM.rectMapToColor = true;
        }
      }
    },
  },
  data() {
    return {
      overlapsRemoved: false,
      rectSizeUniformed: false,
      rectMapToColor: false,
      rect: { list: [], visibility: true, color: "success", size: 10 },
      river: {
        visibility: true,
        color: "info",
        rivers: {
          missouri: {
            visibility: true,
            color: "missouri",
            name: "Missouri",
          },
          mississippi: {
            visibility: true,
            color: "mississippi",
            name: "Mississippi",
          },
          rio_grande: {
            visibility: true,
            color: "rio_grande",
            name: "Rio Grande",
          },
        },
      },
      state: { visibility: true, color: "danger" },
      county: { visibility: true, color: "dark" },
      colorVariant: {
        primary: "rgb(2, 117, 216)",
        info: "rgb(91, 192, 222)",
        success: "rgb(92, 184, 92)",
        warning: "rgb(240, 173, 78)",
        danger: "rgb(217, 83, 79)",
        missouri: "rgb(20, 84, 140)",
        mississippi: "rgb(159, 185, 200)",
        rio_grande: "	rgb(132, 196, 224)",
      },
    };
  },
  computed: {
    getRivers: function () {
      return Object.values(this.river.rivers);
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
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  line-height: 60px;
  background-color: #f5f5f5;
}

.btn-missouri {
  color: #fff !important;
  background-color: rgb(20, 84, 140) !important;
  border-color: rgb(20, 84, 140) !important;
}
.btn-mississippi {
  background-color: rgb(159, 185, 200) !important;
  border-color: rgb(159, 185, 200) !important;
}
.btn-rio_grande {
  background-color: rgb(132, 196, 224) !important;
  border-color: rgb(132, 196, 224) !important;
}

.btn-outline-missouri {
  color: rgb(20, 84, 140) !important;
  border-color: rgb(20, 84, 140) !important;
}
.btn-outline-mississippi {
  color: rgb(159, 185, 200) !important;
  border-color: rgb(159, 185, 200) !important;
}
.btn-outline-rio_grande {
  color: rgb(132, 196, 224) !important;
  border-color: rgb(132, 196, 224) !important;
}
</style>
