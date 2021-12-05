<template>
  <b-container fluid>
    <b-row>
      <b-col cols="8">
        <div>
          <svg
            id="base-layer"
            viewBox="0,0,800,600"
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            <g class="legend">
              <rect
                fill="green"
                stroke="black"
                stroke-width="2"
                x="2"
                y="5"
              ></rect>
              <text x="22" y="18">node</text>

              <rect
                fill="green"
                stroke="red"
                stroke-width="2"
                x="2"
                y="22"
              ></rect>
              <text x="22" y="35">riverX</text>

              <rect
                fill="green"
                stroke="blue"
                stroke-width="2"
                x="2"
                y="39"
              ></rect>
              <text x="22" y="52">nodeX</text>

              <rect fill="blue" x="82" y="39"></rect>
              <text x="102" y="52">nodeX stalemate</text>

              <rect
                fill="green"
                stroke="purple"
                stroke-width="2"
                x="2"
                y="56"
              ></rect>
              <text x="22" y="69">riverX + nodeX</text>

              <!-- rect y= last rect y + 17, text y = rect y +13 -->
            </g>
            <rect
              width="100%"
              height="100%"
              fill="none"
              pointer-events="all"
            ></rect>
            <g id="map"></g>
          </svg>
        </div>
      </b-col>
      <b-col cols="4">
        <div class="table-responsive option_table">
          <table
            class="table table-bordered table-striped table-hover table-borderless"
          >
            <thead>
              <tr>
                <th>Features</th>
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

                  <b-button
                    block
                    :variant="rect.rectSizeUniformed ? 'danger' : 'primary'"
                    v-on:click="setRectSize(!rect.rectSizeUniformed)"
                    >{{ rect.rectSizeUniformed ? "Variable" : "Uniform" }} Rect
                    Size</b-button
                  >

                  <b-button
                    block
                    :variant="rect.rectMapToColor ? 'danger' : 'primary'"
                    v-on:click="setRectColor()"
                    >Map to
                    {{ rect.rectMapToColor ? "Size" : "Color" }}</b-button
                  >

                  <b-button block variant="info">
                    Rect size: {{ rect.size
                    }}<b-form-input
                      id="slider-rect-size"
                      v-model="rect.size"
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      @change="setRectSize()"
                    ></b-form-input
                  ></b-button>
                </td>
                <td>
                  <!-- <b-button
                      :variant="rect.rectOverlapsRemoved ? 'danger' : 'primary'"
                      v-on:click="
                        rect.rectOverlapsRemoved ? init() : removeOverlap()
                      "
                      >{{
                        rect.rectOverlapsRemoved ? "Reset" : "Remove"
                      }}
                      overlaps</b-button
                    > -->

                  <b-button block variant="primary" v-on:click="triggerStep()"
                    >Remove overlaps</b-button
                  >

                  <b-button block variant="info">
                    Iteration limit: {{ iteration.limit
                    }}<b-form-input
                      id="slider-iteration-limit"
                      v-model="iteration.limit"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                    ></b-form-input
                  ></b-button>

                  <b-button
                    block
                    v-if="rect.rectOverlapsRemoved"
                    variant="danger"
                    v-on:click="init()"
                    >Reset overlaps</b-button
                  >

                  <b-button block variant="info">
                    Rect Increment: {{ rect.sizeStep
                    }}<b-form-input
                      id="slider-rect-size"
                      v-model="rect.sizeStep"
                      type="range"
                      min="0.25"
                      max="10"
                      step="0.25"
                    ></b-form-input
                  ></b-button>

                  <b-form-group>
                    <b-form-checkbox-group
                      v-model="river.translation.checked"
                      :options="river.translation.options"
                      stacked
                    ></b-form-checkbox-group>
                  </b-form-group>
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
                  <b-button-group class="d-flex mt-2">
                    <b-button
                      v-for="r in getRivers"
                      :key="r.name"
                      :variant="(river.visibility ? '' : 'outline-') + r.color"
                      v-on:click="toggleFeatureVisibility('river', r.color)"
                      >{{ r.name }}
                      {{
                        getRiverTranslation(r.color)[0] +
                        "," +
                        getRiverTranslation(r.color)[1]
                      }}
                      <br />
                      <span
                        class="arrow"
                        v-html="getRiverTranslation(r.color)[2]"
                      ></span>
                    </b-button>
                  </b-button-group>
                </td>
                <td>
                  <b-button block variant="primary">
                    Corridor length: {{ corridor.length }}
                    <b-form-input
                      id="slider-corridor-length"
                      v-model="corridor.length"
                      type="range"
                      min="5"
                      max="20"
                    ></b-form-input>
                  </b-button>

                  <b-button block variant="info">
                    River thickness: {{ river.width }}
                    <b-form-input
                      id="slider-river-width"
                      v-model="river.width"
                      type="range"
                      min="1"
                      max="10"
                      @change="setRiverWidth()"
                    ></b-form-input>
                  </b-button>

                  <b-button block variant="info">
                    River resolution: {{ river.spacing
                    }}<b-form-input
                      id="slider-river-space"
                      v-model="river.spacing"
                      type="range"
                      min="1"
                      max="100"
                      @change="translateRiver()"
                    ></b-form-input
                  ></b-button>
                </td>
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
                <td>
                  <b-button
                    block
                    :variant="county.border ? 'danger' : 'primary'"
                    v-on:click="highlightBorderingRegion('county')"
                    >Show bordering counties</b-button
                  >
                </td>
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
                <td>
                  <b-button
                    block
                    :variant="state.border ? 'danger' : 'primary'"
                    v-on:click="highlightBorderingRegion('state')"
                    >{{ state.border ? "Hide" : "Show" }} bordering
                    states</b-button
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <b-form-textarea
            id="ta_log"
            v-model="log"
            placeholder="Logs will appear here"
            rows="5"
            max-rows="5"
            disabled
          ></b-form-textarea>
        </div>
      </b-col>
    </b-row>

    <!-- <footer class="footer" style="width: 98%">
      <div class="container">
        <span
          >US County COVID Vaccination Rate. Source: https://www.cdc.gov/.</span
        >
      </div>
    </footer> -->
  </b-container>
</template>

<script>
// @ is an alias to /src
import * as d3 from "d3";
import * as pip from "point-in-svg-polygon";
import * as topojson from "topojson-client";
import * as cola from "webcola";
import * as flattener from "../helper/flattener";
import findPathIntersections from "path-intersection";

export default {
  name: "Home",
  methods: {
    async init() {
      const __VM = this;

      const calculateRectSize = (d) => {
        return getVacRate(d) * 0.2;
      };

      const getVacRate = (d) => {
        return (
          this.indicators.find((f) => f.FIPS === d.properties.FIPS)
            .Series_Complete_Pop_Pct || 0
        );
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

      let svg = __VM.svg;

      // generate an arrow
      svg
        .append("svg:defs")
        .append("svg:marker")
        .attr("id", "arrow")
        .attr("refX", 1.5)
        .attr("refY", 1.5)
        .attr("markerWidth", 3)
        .attr("markerHeight", 3)
        .attr("orient", "auto-start-reverse")
        .append("svg:path")
        .attr("d", "M0,0 L0,3 L3,1.5")
        .attr("stroke", "none")
        .attr("fill", "blue");

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

      const getBorderingColor = (d) => {
        if (d.properties.river.length > 0) {
          return __VM.colorVariant[
            __VM.river.rivers[d.properties.river[0]].color
          ];
        } else {
          return "none";
        }
      };

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
        .attr("fill_pip", (d) => getBorderingColor(d))
        .attr("county_id", (d) => d.properties.id)
        .on("click", function (e, d) {
          console.log(d.properties.id);
        });

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
        .attr("fill_pip", (d) => getBorderingColor(d))
        .attr("stroke", __VM.colorVariant[__VM.state.color])
        .attr("state_id", (d) => d.properties.fid);

      const colormap = d3.scaleSequential(d3.interpolatePRGn);

      // county data layer
      const rects = svg
        .append("g")
        .attr("class", "rect-layer")
        // .style("visibility", "hidden")
        .selectAll("rect")
        .data(__VM.county_list)
        .enter()
        .append("rect")
        .attr("colormap", (d) => colormap(getVacRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("id", (d) => d.properties.NAME)
        // .attr("width", (d) => calculateRectSize(d))
        // .attr("height", (d) => calculateRectSize(d))

        .attr("width", __VM.rect.size)
        .attr("height", __VM.rect.size)
        .attr("stroke", "black")
        .attr("stroke-width", "0.3")
        .attr("fill", (d) => {
          // let state;

          // let temp = d.properties.NAME.split(",");

          // if (temp.length > 1) {
          //   state = temp[1].trim();
          // } else {
          //   state = temp[0].trim();
          // }

          // if (state.includes("Oregon")) {
          //   return "rgb(2, 117, 216)";
          // } else if (state.includes("Washington")) {
          //   return "rgb(217, 83, 79)";
          // } else if (state.includes("Illinois")) {
          //   return "rgb(17, 83, 79)";
          // } else if (state.includes("Pennsylvania")) {
          //   return "rgb(117, 83, 79)";
          // } else if (state.includes("Massa")) {
          //   return "rgb(117, 83, 179)";
          // } else {
          //   return __VM.colorVariant[__VM.rect.color];
          // }

          return __VM.colorVariant[__VM.rect.color];
        })
        .attr("original_fill", (d) => {
          return __VM.colorVariant[__VM.rect.color];
        })
        .on("mouseover", function (e, d) {
          // d3.select(this).attr("fill", "red");
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
          // __VM.setRectColor(this);
          tooltip.style("visibility", "hidden");
        });

      // original river layer
      const river_layer = svg.append("g").attr("class", "river-layer");
      for (const river of Object.keys(__VM.river.rivers)) {
        __VM.river.rivers[river].translate.finalX = 0;
        __VM.river.rivers[river].translate.finalY = 0;
        const r = river_layer.append("g").attr("class", `${river}`);
        r.append("g").attr("class", "river");
        r.append("g").attr("class", "river-edge");
      }

      __VM.translateRiver();

      __VM.mapNodeColorToRegion();

      __VM.rect.rectOverlapsRemoved = false;
    },
    removeOverlap(repeat = false) {
      const __VM = this;

      const data = [];

      if (!__VM.rect.visibility) {
        __VM.toggleFeatureVisibility("rect");
      }

      // prepration before removing overlaps
      if (!repeat) {
        __VM.rect.size = Number(__VM.rect.size) + Number(__VM.rect.sizeStep);
        __VM.setRectSize();
      }

      // preparation before redrawing rects and edges
      d3.selectAll(".river-edge > path").remove();

      // prepare an array for webcola
      d3.selectAll(".rect-layer > rect")._groups[0].forEach((r, i) => {
        r = d3.select(r);

        const x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = __VM.rect.size,
          h = __VM.rect.size;

        const newRect = new cola.Rectangle(x, x + w, y, y + h);
        // add historical x,y
        let history = [];
        if (!r.attr("history")) {
          history.unshift([x, y]);
          r.attr("history", JSON.stringify(history));
        } else {
          history = JSON.parse(r.attr("history"));

          if (history[0][0] !== x && history[0][1] !== y) {
            history.unshift([x, y]);
            r.attr("history", JSON.stringify(history));
          }
        }

        newRect.history = history;

        data[i] = newRect;
      });

      // remove overlaps
      cola.removeOverlaps(data);

      const timer = 20 * __VM.timer * __VM.rect.size;

      // draw river crossing edges
      for (const [i, rect] of d3
        .selectAll(".rect-layer > rect")
        ._groups[0].entries()) {
        // redraw rects using new coordinates

        const r = d3.select(rect);

        r.attr("stroke", () => {
          let res = "black";

          if (r.attr("nodeX")) {
            res = "blue";
          }

          if (r.attr("riverX")) {
            res = "red";
          }

          if (r.attr("nodeX") && r.attr("riverX")) {
            res = "purple";
          }

          return res;
        })
          .attr("stroke-width", () => {
            return r.attr("nodeX") || r.attr("riverX") ? "0.5" : "0.3";
          })
          //.attr("fill", __VM.colorVariant[__VM.rect.color])
          .transition()
          .duration(timer)
          .attr("x", data[i].x)
          .attr("y", data[i].y);

        if (
          data[i].history[0][0] !== data[i].x ||
          data[i].history[0][1] !== data[i].y
        ) {
          // add ORAed x,y into the history

          __VM.writeRectHistory(r, data[i].x, data[i].y);

          __VM.checkNodeX(data[i], r);
          // else {
          //   // un-nodeX
          //   if (r.attr("nodeX") === true) {
          //     r.attr("fill", __VM.colorVariant[__VM.rect.color])
          //       .attr("stroke", "black")
          //       .attr("nodeX", null);
          //   }
          // }
        }
      }

      let translate = false;

      if (!__VM.getRiverTranslationStatic) {
        //non-repeating ORA
        translate = !repeat;

        //repeating ORA
        if (repeat) {
          //not first iteration
          if (__VM.iteration.current > 0) {
            //if repeat ORA is allowed
            translate = __VM.getRiverTranslationRepeat;
          }
        }
      }

      if (translate) {
        __VM.calculateRiverTranslation();
      }

      __VM.rect.rectOverlapsRemoved = true;

      __VM.step.step_index = 1;
      // __VM.delay(timer * 1.5).then(() => {
      // __VM.checkORAIteration();
      // });
    },
    checkORAIteration() {
      const __VM = this;

      if (__VM.iteration.current >= __VM.iteration.limit) {
        __VM.log += `Overlap removal iteration: ${__VM.iteration.current} stopped, iteration limit of ${__VM.iteration.limit} reached. \n`;

        d3.selectAll(".river-edge > path").remove();
        __VM.iteration.current = 0;

        __VM.delay(20 * __VM.timer * __VM.rect.size).then(() => {
          __VM.drawCorridor();
        });
      } else {
        const numEdges = d3.selectAll(".river-edge > path")._groups[0].length;

        if (numEdges > 0) {
          __VM.iteration.current++;

          __VM.log += `Overlap removal iteration: ${__VM.iteration.current}, finished with ${numEdges} nodeX \n`;

          __VM.removeOverlap(true);
        } else {
          __VM.log += `Overlap removal iteration: ${__VM.iteration.current} finished, no more nodeX \n`;

          __VM.iteration.current = 0;

          __VM.step.step_index = 0;
        }

        const ta_log = document.querySelector("#ta_log");
        ta_log.scrollTop = ta_log.scrollHeight;
      }
    },
    drawCorridor() {
      const __VM = this;

      let quadrant, corridor, hyp, hyp_extend, adj_extend, oppo_extend;
      const size = __VM.rect.size;

      const halfSize = size / 2;

      let rect = d3.select(`#map rect[fill="blue"]`);

      const history = JSON.parse(rect.attr("history"))[1];

      const x = Number(rect.attr("x"));
      const y = Number(rect.attr("y"));

      const previous = [history[0], history[1]];
      const current = [x, y];

      // 4 edges of previous rect position
      const p_p1 = [previous[0] + size, previous[1]];
      const p_p2 = [previous[0], previous[1]];
      const p_p3 = [previous[0], previous[1] + size];
      const p_p4 = [previous[0] + size, previous[1] + size];

      // 4 edges of current rect position
      const c_p1 = [current[0] + size, current[1]];
      const c_p2 = [current[0], current[1]];
      const c_p3 = [current[0], current[1] + size];
      const c_p4 = [current[0] + size, current[1] + size];

      // the extended points of two lines
      let f_p1, f_p2;

      const getquadrantY = (previous, current, quadrantX) => {
        // y increases
        if (previous[1] < current[1]) {
          switch (quadrantX) {
            case "+":
              quadrant = 4;
              hyp = Math.sqrt(
                Math.pow(c_p1[0] - p_p1[0], 2) + Math.pow(c_p1[1] - p_p1[1], 2)
              );
              hyp_extend = hyp + __VM.corridor.length;

              adj_extend = (hyp_extend * Math.abs(c_p1[1] - p_p1[1])) / hyp;
              oppo_extend = Math.sqrt(
                Math.pow(hyp_extend, 2) - Math.pow(adj_extend, 2)
              );

              f_p1 = [p_p1[0] + oppo_extend, p_p1[1] + adj_extend];
              f_p2 = [f_p1[0] - size, f_p1[1] + size];

              corridor = d3.line()([p_p1, p_p3, f_p2, f_p1, p_p1]);
              return 4;
            case "-":
              quadrant = 3;

              hyp = Math.sqrt(
                Math.pow(c_p2[0] - p_p2[0], 2) + Math.pow(c_p2[1] - p_p2[1], 2)
              );
              hyp_extend = hyp + __VM.corridor.length;
              adj_extend = (hyp_extend * Math.abs(c_p2[1] - p_p2[1])) / hyp;
              oppo_extend = Math.sqrt(
                Math.pow(hyp_extend, 2) - Math.pow(adj_extend, 2)
              );

              f_p1 = [p_p2[0] - oppo_extend, p_p2[1] + adj_extend];
              f_p2 = [f_p1[0] + size, f_p1[1] + size];

              corridor = d3.line()([p_p2, p_p4, f_p2, f_p1, p_p2]);

              return 3;
            case "=":
              f_p1 = [p_p3[0], p_p3[1] + __VM.corridor.length];
              f_p2 = [p_p4[0], p_p4[1] + __VM.corridor.length];

              corridor = d3.line()([p_p3, f_p1, f_p2, p_p4, p_p3]);

              return 7;
            default:
              break;
          }
        } else if (previous[1] > current[1]) {
          switch (quadrantX) {
            case "+":
              quadrant = 1;

              hyp = Math.sqrt(
                Math.pow(c_p2[0] - p_p2[0], 2) + Math.pow(c_p2[1] - p_p2[1], 2)
              );
              hyp_extend = hyp + __VM.corridor.length;
              adj_extend = (hyp_extend * Math.abs(c_p2[1] - p_p2[1])) / hyp;
              oppo_extend = Math.sqrt(
                Math.pow(hyp_extend, 2) - Math.pow(adj_extend, 2)
              );

              f_p1 = [p_p2[0] + oppo_extend, p_p2[1] - adj_extend];
              f_p2 = [f_p1[0] + size, f_p1[1] + size];

              corridor = d3.line()([p_p2, p_p4, f_p2, f_p1, p_p2]);
              return 1;
            case "-":
              quadrant = 2;

              hyp = Math.sqrt(
                Math.pow(c_p1[0] - p_p1[0], 2) + Math.pow(c_p1[1] - p_p1[1], 2)
              );
              hyp_extend = hyp + __VM.corridor.length;
              adj_extend = (hyp_extend * Math.abs(c_p1[1] - p_p1[1])) / hyp;
              oppo_extend = Math.sqrt(
                Math.pow(hyp_extend, 2) - Math.pow(adj_extend, 2)
              );

              f_p1 = [p_p1[0] - oppo_extend, p_p1[1] - adj_extend];
              f_p2 = [f_p1[0] - size, f_p1[1] + size];

              corridor = d3.line()([p_p1, p_p3, f_p2, f_p1, p_p1]);
              return 2;
            case "=":
              quadrant = 5;

              f_p1 = [p_p1[0], p_p1[1] - __VM.corridor.length];
              f_p2 = [p_p2[0], p_p2[1] - __VM.corridor.length];

              corridor = d3.line()([p_p1, f_p1, f_p2, p_p2, p_p1]);
              return 5;
            default:
              break;
          }
        } else if (previous[1] === current[1]) {
          switch (quadrantX) {
            case "+":
              quadrant = 8;

              f_p1 = [p_p1[0] + __VM.corridor.length, p_p1[1]];
              f_p2 = [p_p4[0] + __VM.corridor.length, p_p4[1]];

              corridor = d3.line()([p_p1, f_p1, f_p2, p_p4, p_p1]);

              return 8;
            case "-":
              quadrant = 6;

              f_p1 = [p_p2[0] - __VM.corridor.length, p_p2[1]];
              f_p2 = [p_p3[0] - __VM.corridor.length, p_p3[1]];

              corridor = d3.line()([p_p2, f_p1, f_p2, p_p3, p_p2]);

              return 6;
            case "=":
              return "impossible";
            default:
              break;
          }
        }
      };

      // quadrant
      //   5
      //  2|1
      //6--|--8
      //  3|4
      //   7

      const getquadrantX = (previous, current) => {
        // x increases
        if (previous[0] < current[0]) {
          return getquadrantY(previous, current, "+");
        }
        // x decreases
        else if (previous[0] > current[0]) {
          return getquadrantY(previous, current, "-");
        }
        // x unchanged
        else if (previous[0] === current[0]) {
          return getquadrantY(previous, current, "+");
        }
      };

      getquadrantX(previous, current);

      __VM.svg
        .append("path")
        .attr("d", corridor)
        .attr("class", "corridor")
        .attr("stroke", "blue")
        .attr("stroke-width", "1")
        .attr("fill", "none");

      const timer = 100 * __VM.timer;

      // rect
      //   .transition()
      //   .duration(timer)
      //   .attr("x", quadrant === 1 || quadrant === 4 ? x + size : x - size)
      //   .attr("y", quadrant === 1 || quadrant === 2 ? y - size : y + size)
      //   .attr("fill", "pink");

      const moveRectC = (rect, previous) => {
        const x_new =
          quadrant === 1 || quadrant === 4 || quadrant === 8
            ? x + halfSize
            : x - halfSize;

        const y_new =
          quadrant === 1 || quadrant === 2 || quadrant === 5
            ? y + halfSize
            : y - halfSize;

        rect
          .transition()
          .duration(timer)
          .attr("x", () => {
            if (Math.abs(x - previous[0]) < halfSize) {
              return x_new;
            }
            return previous[0];
          })
          .attr("y", () => {
            if (Math.abs(y - previous[1]) < halfSize) {
              return y_new;
            }
            return previous[1];
          });

        __VM.delay(timer).then(() => {
          // __VM.runPIP(rect);

          const rectObj = {
            x: rect.attr("x"),
            y: rect.attr("y"),
            history: JSON.parse(rect.attr("history")),
          };

          __VM.writeRectHistory(rect, x_new, y_new);

          __VM.checkNodeX(rectObj, rect);

          // reset fill color for nodeC
          if (rect.attr("nodeX")) {
            rect.attr("stroke", "blue");
          } else {
            rect.attr("stroke", "pink");
          }

          rect.attr("fill", rect.attr("original_fill"));
        });
      };

      moveRectC(rect, previous);

      for (let [i, rect] of d3
        .selectAll(".rect-layer > rect")
        ._groups[0].entries()) {
        rect = d3.select(rect);

        const history = JSON.parse(rect.attr("history"))[0];

        const x_in = Number(rect.attr("x")) + halfSize;
        const y_in = Number(rect.attr("y")) + halfSize;

        if (x_in !== x && y_in !== y) {
          if (pip.isInside([x_in, y_in], corridor)) {
            moveRectC(rect, history);

            // check river crossing
            // __VM.delay(timer).then(() => {
            //   const rectObj = {
            //     x: x_in,
            //     y: y_in,
            //     history: history,
            //   };

            //   if (rect.attr("id") === "Douglas County, Nebraska") {
            //     console.log("checkNodeX");
            //     console.log(rect, history);
            //   }

            //   __VM.checkNodeX(rectObj, rect);
            //   // __VM.removeOverlap(true);
            // });

            // __VM.delay(__VM.timer).then(() => {
            //   __VM.runPIP(rect);
            //   // reset fill color for nodeC
            //   rect.attr("fill", rect.attr("original_fill"));
            // });
          }
        }
      }

      __VM.step.step_index = 2;
      __VM.delay(timer).then(() => {
        d3.select(".corridor").remove();
        // __VM.removeOverlap(true);
      });
    },
    checkNodeX(rect, d3Rect) {
      const __VM = this;

      const nodeWidth = __VM.rect.size / 2;

      const line = d3.line()([
        [Number(rect.x) + nodeWidth, Number(rect.y) + nodeWidth],
        [
          Number(rect.history[0][0]) + nodeWidth,
          Number(rect.history[0][1]) + nodeWidth,
        ],
      ]);

      const checkIntersect = (line) => {
        let intersected = false;
        for (const river of Object.keys(__VM.river.rivers)) {
          // const river_path = d3.select(`g.${river} .river path`).attr("d");

          const river_path = flattener.flatten_path(
            document.querySelector(`#${river}`).getPathData(),
            [
              __VM.river.rivers[river].translate.finalX,
              __VM.river.rivers[river].translate.finalY,
            ]
          );

          const river_edge_layer = d3.select(`.${river} .river-edge`);

          const intersectPoints = findPathIntersections(river_path, line, true);

          if (intersectPoints) {
            intersected = true;
            __VM.river.rivers[river].translate.x +=
              Number(rect.x) - Number(rect.history[0][0]);
            __VM.river.rivers[river].translate.y +=
              Number(rect.y) - Number(rect.history[0][1]);

            river_edge_layer
              .append("path")
              .attr("d", line)
              .attr("stroke", "blue")
              .attr("stroke-width", "1px")
              .attr("fill", "none")
              .attr("marker-end", "url(#arrow)");
          }
        }

        return intersected;
      };
      if (checkIntersect(line)) {
        d3Rect
          .attr("fill", "blue")
          .attr("stroke", "blue")
          .attr("nodeX", true)
          .transition()
          .duration(__VM.timer * 100)
          .attr("x", rect.history[0][0])
          .attr("y", rect.history[0][1]);

        __VM.writeRectHistory(d3Rect, rect.history[0][0], rect.history[0][1]);

        __VM.delay(__VM.timer * 100).then(() => {
          let history = JSON.parse(d3Rect.attr("history"));

          if (history.length > 3) {
            if (
              history[0][0] === history[2][0] &&
              history[0][1] === history[2][1]
            ) {
              // a stalemate nodeX
              d3Rect.attr("fill", "blue");
            } else {
              // reset fill color for non-stalemate nodeX
              d3Rect.attr("fill", d3Rect.attr("original_fill").trim());
            }
          } else {
            d3Rect.attr("fill", d3Rect.attr("original_fill").trim());
          }
        });
      }
    },
    toggleFeatureVisibility(type, name = false) {
      const __VM = this;

      __VM[type].visibility = !__VM[type].visibility;
      let layer = `.${type}-layer`;
      if (type === "river") {
        // toggle the specific river
        if (name) {
          layer = `.${type}-layer > .${name}`;
          __VM[type].rivers[name].visibility = !__VM[type].rivers[name]
            .visibility;

          d3.select(layer).style(
            "visibility",
            __VM[type].rivers[name].visibility ? "visible" : "hidden"
          );
          return;
        }
        // toggle all rivers
        else {
          layer = ".river-layer";

          Object.values(__VM[type].rivers).forEach(
            (r) => (r.visibility = __VM[type].visibility)
          );

          Object.keys(__VM.river.rivers).forEach((river) => {
            __VM.river.rivers[river].visibility = __VM[type].visibility;

            d3.select(`.river-layer > .${river}`).style(
              "visibility",
              __VM[type].visibility ? "visible" : "hidden"
            );
          });
        }
      }

      d3.selectAll(layer).style(
        "visibility",
        __VM[type].visibility ? "visible" : "hidden"
      );
    },
    setRectSize(uniformed = false) {
      const __VM = this;
      __VM.rect.rectSizeUniformed = uniformed;
      let size = __VM.rect.size;
      if (__VM.rect.rectSizeUniformed) {
        size = 10;
      }
      d3.selectAll(".rect-layer > rect")
        .attr("width", size)
        .attr("height", size);
    },
    setRectColor(singleRect) {
      const __VM = this;
      const changeColor = (r, color) => {
        d3.select(r).attr("fill", color);
      };

      if (__VM.rect.rectMapToColor) {
        if (singleRect) {
          changeColor(singleRect, d3.select(singleRect).attr("colormap"));
        } else {
          d3.selectAll(".rect-layer > rect")._groups[0].forEach((r) => {
            changeColor(r, __VM.colorVariant[__VM.rect.color]);
          });

          __VM.rect.rectMapToColor = false;
        }
      } else {
        if (singleRect) {
          changeColor(singleRect, __VM.colorVariant[__VM.rect.color]);
        } else {
          d3.selectAll(".rect-layer > rect")._groups[0].forEach((r) => {
            const colormap = d3.select(r).attr("colormap");
            changeColor(r, colormap);
          });

          __VM.rect.rectMapToColor = true;
        }
      }
    },
    highlightBorderingRegion(type) {
      const __VM = this;

      __VM[type].border = !__VM[type].border;

      d3.selectAll(`.${type}-layer > path`).each(function (d) {
        return d3.select(this).attr("fill", (d) => {
          return __VM[type].border ? d3.select(this).attr("fill_pip") : "none";
        });
      });
    },
    setRiverWidth() {
      const __VM = this;

      d3.selectAll(".river > path").style(
        "stroke-width",
        `${__VM.river.width}px`
      );

      d3.selectAll(".river > circle").attr(
        "r",
        `${__VM.river.width > 4 ? 4 : __VM.river.width}`
      );
    },
    translateRiver() {
      const __VM = this;

      Object.keys(__VM.river.rivers).forEach((river) => {
        const points = topojson.mesh(
          __VM.shapefile,
          __VM.shapefile.objects[river]
        ).coordinates[0];

        let spacing = Number(__VM.river.spacing);

        const resolution = [];

        for (let i = 0; i < points.length; i += spacing) {
          if (points[i]) {
            resolution.push(points[i]);
          }

          if (i + spacing >= points.length - 1) {
            resolution.push(points[points.length - 1]);
          }
        }

        __VM.river.rivers[river].resolution = resolution;

        d3.selectAll(`.${river} .river *`).remove();

        const river_layer = d3.select(`.${river} .river`);

        river_layer
          .append("path")
          .attr("id", `${river}`)
          .attr("d", d3.line()(resolution))
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("stroke-width", `${__VM.river.width}px`)
          .attr("fill", "none");

        river_layer
          .selectAll("circle")
          .data(resolution)
          .enter()
          .append("circle")
          .attr("fill", "red")
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => d[1])
          .attr("r", __VM.river.width > 4 ? 4 : __VM.river.width);

        let timer = 0;

        if (!__VM.getRiverTranslationStatic) {
          timer = 100 * __VM.timer;
          river_layer
            .transition()
            .duration(timer)
            .attr(
              "transform",
              `translate(${__VM.river.rivers[river].translate.finalX},${__VM.river.rivers[river].translate.finalY})`
            );
        }
        __VM.delay(timer).then(() => __VM.detectRiverXNodes());
      });
    },
    calculateRiverTranslation() {
      const __VM = this;
      for (const river of Object.keys(__VM.river.rivers)) {
        const x = __VM.river.rivers[river].translate.x;
        const y = __VM.river.rivers[river].translate.y;

        __VM.river.rivers[river].translate.finalXOld =
          __VM.river.rivers[river].translate.finalX;

        __VM.river.rivers[river].translate.finalYOld =
          __VM.river.rivers[river].translate.finalY;

        const size = __VM.rect.size;

        if (x > 0) {
          __VM.river.rivers[river].translate.finalX += size;
        }

        if (x < 0) {
          __VM.river.rivers[river].translate.finalX -= size;
        }

        if (y > 0) {
          __VM.river.rivers[river].translate.finalY += size;
        }

        if (y < 0) {
          __VM.river.rivers[river].translate.finalY -= size;
        }

        __VM.river.rivers[river].translate.x = 0;
        __VM.river.rivers[river].translate.y = 0;
      }

      __VM.translateRiver();
    },
    detectRiverXNodes() {
      const __VM = this;

      Object.keys(__VM.river.rivers).forEach((river) => {
        const { resolution, translate } = __VM.river.rivers[river];
        const resCurrent = [];
        const resOld = [];

        resolution.forEach((r) => {
          resCurrent.push([r[0] + translate.finalX, r[1] + translate.finalY]);
          resOld.push([r[0] + translate.finalXOld, r[1] + translate.finalYOld]);
        });

        // draw river crossed areas
        if (JSON.stringify(resCurrent) !== JSON.stringify(resOld)) {
          d3.selectAll(`.${river}.crossedArea`).remove();

          const crossedRegion = d3.line()([
            ...resCurrent,
            ...resOld.reverse(),
            resCurrent[0],
          ]);

          d3.select("#map")
            .append("path")
            .attr("class", `${river} crossedArea`)
            .attr("d", crossedRegion)
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("fill", "none");

          for (const [i, rect] of d3
            .selectAll(".rect-layer > rect")
            ._groups[0].entries()) {
            const inside = pip.isInside(
              [d3.select(rect).attr("x"), d3.select(rect).attr("y")],
              crossedRegion
            );
            if (inside) {
              d3.select(rect)
                .attr("stroke", "red")
                .attr("stroke-width", "0.5")
                .attr("riverX", true);
            }
          }
        }
      });
    },
    getRiverTranslation(name) {
      const t = this.river.rivers[name].translate;

      let left = false;
      let right = false;
      let up = false;
      let down = false;

      if (t.finalX > 0) {
        right = true;
      } else if (t.finalX < 0) {
        left = true;
      }

      if (t.finalY > 0) {
        down = true;
      } else if (t.finalY < 0) {
        up = true;
      }

      let arrow;

      if (!(left || right || up || down)) {
        arrow = "&#183;";
      } else {
        arrow = "0";

        if (up) {
          arrow = "1";
        } else if (down) {
          arrow = "2";
        }

        if (left) {
          arrow += "1";
        } else if (right) {
          arrow += "2";
        }
      }

      if (arrow === "01") {
        arrow = "&#8592;";
      }

      if (arrow === "02") {
        arrow = "&#10132;";
      }

      if (arrow === "10") {
        arrow = "&#8593;";
      }

      if (arrow === "20") {
        arrow = "&#10142;";
      }

      if (arrow === "11") {
        arrow = "&#11017;";
      }

      if (arrow === "12") {
        arrow = "&#11016;";
      }

      if (arrow === "21") {
        arrow = "&#11019;";
      }

      if (arrow === "22") {
        arrow = "&#11018;";
      }
      return [t.finalX, t.finalY, arrow];
    },
    triggerStep() {
      const __VM = this;

      const step = __VM.step.step_index;

      switch (__VM.step.step_list[step]) {
        case "ORA":
          __VM.removeOverlap();
          break;
        case "ORA Repeat":
          __VM.removeOverlap(true);
          break;
        case "Check ORA":
          __VM.checkORAIteration();
          break;
        case "Corridor":
          __VM.drawCorridor();
          break;
        default:
          break;
      }
    },
    mapNodeColorToRegion() {
      const __VM = this;
      __VM.region.yellow = [];
      __VM.region.blue = [];

      let yellowFirst, blueFirst;

      Object.keys(__VM.river.rivers).forEach((river) => {
        const res = __VM.river.rivers[river].resolution;

        if (river === "missouri") {
          __VM.region.yellow.push(...res);
          yellowFirst = res[0];
        }

        if (river === "mississippi") {
          __VM.region.yellow.push(...res.slice(12));
          __VM.region.blue.push(...res);
          blueFirst = res[0];
        }

        if (river === "rio_grande") {
          __VM.region.yellow.push(...res.reverse());
        }
      });

      __VM.region.yellow.push(yellowFirst);

      __VM.region.blue.push([508, 320]);
      __VM.region.blue.push([625, 320]);
      __VM.region.blue.push([625, 60]);
      __VM.region.blue.push([370, 60]);
      __VM.region.blue.push(blueFirst);

      __VM.svg
        .append("path")
        .attr("d", d3.line()(__VM.region.blue))
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("fill", "none");

      __VM.svg
        .append("path")
        .attr("d", d3.line()(__VM.region.yellow))
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("fill", "none");

      for (let [i, rect] of d3
        .selectAll(".rect-layer > rect")
        ._groups[0].entries()) {
        __VM.runPIP(d3.select(rect));
      }
    },
    runPIP(rect) {
      const __VM = this;
      const nodeWidth = __VM.rect.size / 2;
      if (
        pip.isInside(
          [
            Number(rect.attr("x")) + nodeWidth,
            Number(rect.attr("y")) + nodeWidth,
          ],
          d3.line()(__VM.region.yellow)
        )
      ) {
        rect.attr("fill", __VM.colorVariant.mississippi);
        rect.attr("original_fill", __VM.colorVariant.mississippi);
      } else if (
        pip.isInside(
          [
            Number(rect.attr("x")) + nodeWidth,
            Number(rect.attr("y")) + nodeWidth,
          ],
          d3.line()(__VM.region.blue)
        )
      ) {
        rect.attr("fill", __VM.colorVariant.rio_grande);
        rect.attr("original_fill", __VM.colorVariant.rio_grande);
      }
    },
    writeRectHistory(rect, x, y) {
      let history = JSON.parse(rect.attr("history"));
      history.unshift([x, y]);
      rect.attr("history", JSON.stringify(history));
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
  data() {
    return {
      step: {
        step_index: 0,
        step_list: ["ORA", "Check ORA", "ORA Repeat", "Corridor"],
      },
      iteration: { current: 0, limit: 1 },
      timer: 50,
      log: "",
      corridor: {
        length: 30,
      },
      rect: {
        rectOverlapsRemoved: false,
        rectSizeUniformed: false,
        rectMapToColor: false,
        visibility: true,
        color: "success",
        size: 3,
        sizeStep: 0.25,
      },
      river: {
        translation: {
          checked: ["static"],
          options: [
            {
              text: "Disable River Translation",
              value: "static",
              disabled: false,
            },
            {
              text: "Repeat River Translation",
              value: "repeat",
              disabled: true,
            },
          ],
        },
        visibility: true,
        width: 2,
        spacing: 10,
        color: "info",
        rivers: {
          missouri: {
            visibility: true,
            color: "missouri",
            name: "Missouri",
            translate: {
              x: 0,
              y: 0,
              finalX: 0,
              finalXOld: 0,
              finalY: 0,
              finalYOld: 0,
            },
          },
          mississippi: {
            visibility: true,
            color: "mississippi",
            name: "Mississippi",
            translate: {
              x: 0,
              y: 0,
              finalX: 0,
              finalXOld: 0,
              finalY: 0,
              finalYOld: 0,
            },
          },
          rio_grande: {
            visibility: true,
            color: "rio_grande",
            name: "Rio Grande",
            translate: {
              x: 0,
              y: 0,
              finalX: 0,
              finalXOld: 0,
              finalY: 0,
              finalYOld: 0,
            },
          },
        },
      },
      state: { border: false, visibility: true, color: "danger" },
      county: { border: false, visibility: true, color: "dark" },
      region: { blue: [], yellow: [] },
      colorVariant: {
        primary: "rgb(2, 117, 216)",
        info: "rgb(91, 192, 222)",
        success: "rgb(92, 184, 92)",
        warning: "rgb(240, 173, 78)",
        danger: "rgb(217, 83, 79)",
        missouri: "rgb(20, 84, 140)",
        mississippi: "rgb(240, 173, 78)",
        rio_grande: "	rgb(132, 196, 224)",
      },
    };
  },
  computed: {
    getRivers: function () {
      return Object.values(this.river.rivers);
    },
    getRiverTranslationStatic: function () {
      return this.river.translation.checked.includes("static");
    },
    getRiverTranslationRepeat: function () {
      return this.river.translation.checked.includes("repeat");
    },
  },
  watch: {
    "river.translation.checked": {
      deep: true,
      handler(val) {
        this.river.translation.options[1].disabled = val.includes("static");
      },
    },
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
        .features.filter((e) => e.geometry && e.geometry.type)
    );

    this.init();
    this.rect.rectSizeUniformed = false;
    this.rect.rectOverlapsRemoved = false;
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
  background-color: rgb(240, 173, 78) !important;
  border-color: rgb(240, 173, 78) !important;
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
  color: rgb(240, 173, 78) !important;
  border-color: rgb(240, 173, 78) !important;
}
.btn-outline-rio_grande {
  color: rgb(132, 196, 224) !important;
  border-color: rgb(132, 196, 224) !important;
}

.btn-group-vertical .btn:not(:last-child) {
  border-bottom: 2px solid white !important;
}

.btn-group .btn:not(:last-child) {
  border-right: 2px solid white !important;
}

.arrow {
  font-size: 20px;
}

g.legend > rect {
  width: 15px;
  height: 15px;
}
</style>
