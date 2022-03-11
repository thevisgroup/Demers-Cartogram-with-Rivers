<template>
  <b-container fluid>
    <b-row>
      <b-col cols="8">
        <div>
          <svg
            id="base-layer"
            viewBox="0,0,800,800"
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            <rect
              width="800"
              height="800"
              style="fill: none; stroke-width: 4; stroke: rgb(43, 222, 221)"
            />

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
                stroke="pink"
                stroke-width="2"
                x="82"
                y="5"
              ></rect>
              <text x="102" y="18">node pushed</text>

              <rect
                fill="green"
                stroke="red"
                stroke-width="2"
                x="2"
                y="27"
              ></rect>
              <text x="22" y="40">riverX</text>

              <rect
                fill="green"
                stroke="blue"
                stroke-width="2"
                x="2"
                y="49"
              ></rect>
              <text x="22" y="62">nodeX</text>

              <rect fill="blue" x="82" y="49"></rect>
              <text x="102" y="62">nodeX stalemate</text>

              <rect
                fill="green"
                stroke="purple"
                stroke-width="2"
                x="2"
                y="71"
              ></rect>
              <text x="22" y="84">riverX + nodeX</text>

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
                  <!-- <b-button
                    block
                    :variant="(node.visibility ? '' : 'outline-') + node.color"
                    v-on:click="toggleFeatureVisibility('node')"
                    >Rectangle</b-button
                  > -->

                  <!-- <b-button
                    block
                    :variant="node.nodeSizeUniformed ? 'danger' : 'primary'"
                    v-on:click="setNodeSize(!node.nodeSizeUniformed)"
                    >{{ node.nodeSizeUniformed ? "Variable" : "Uniform" }} Rect
                    Size</b-button
                  > -->

                  <!-- <b-button
                    block
                    :variant="node.nodeMapToColor ? 'danger' : 'primary'"
                    v-on:click="setRectColor()"
                    >Map to
                    {{ node.nodeMapToColor ? "Size" : "Color" }}</b-button
                  > -->
                  <b-button
                    block
                    :variant="(centroid.visibility ? '' : 'outline-') + 'info'"
                    v-on:click="toggleFeatureVisibility('centroid')"
                    >Centroid</b-button
                  >

                  <b-button block variant="info">
                    Node size: {{ node.size
                    }}<b-form-input
                      id="slider-node-size"
                      :value="node.size"
                      type="range"
                      min="0.25"
                      :max="node.maxSize > 0 ? node.maxSize : 100"
                      step="0.25"
                      @change="setNodeSize(node.size, $event)"
                    ></b-form-input
                  ></b-button>

                  <b-button block variant="info">
                    Node size increment: {{ node.sizeStep
                    }}<b-form-input
                      id="slider-node-size"
                      v-model="node.sizeStep"
                      type="range"
                      min="0.25"
                      max="10"
                      step="0.25"
                    ></b-form-input
                  ></b-button>

                  <b-row>
                    <b-col sm="5">Max node size:</b-col>
                    <b-col sm="7">
                      <input
                        v-model="node.maxSize"
                        type="number"
                        class="form-control"
                        placeholder="Max node size allowed"
                      />
                    </b-col>
                  </b-row>
                </td>
                <td>
                  <b-button
                    block
                    variant="primary"
                    v-on:click="removeOverlap()"
                    :disabled="step.button_disabled"
                    >Remove overlaps</b-button
                  >

                  <b-form-checkbox
                    v-model="step.continous"
                    name="check-button"
                    switch
                  >
                    Continous mode: {{ step.continous }}
                  </b-form-checkbox>

                  <b-form-checkbox v-model="debug" name="check-button" switch>
                    Debug mode: {{ debug }}
                  </b-form-checkbox>

                  <!-- <b-button block variant="info">
                    Iteration limit: {{ iteration.limit
                    }}<b-form-input
                      id="slider-iteration-limit"
                      v-model="iteration.limit"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                    ></b-form-input
                  ></b-button> -->

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
                      min="100"
                      max="230"
                      step="5"
                      @change="translateRiver()"
                    ></b-form-input
                  ></b-button>
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

      const calculatenodesize = (d) => {
        return getIndicatorRate(d) * 0.2;
      };

      const getIndicatorRate = (d) => {
        const current = __VM.indicators[d.properties.id].Person.value;
        const { range, min } = __VM.indicators.metadata.Person.value;
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
        .attr("fill", "black");

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

      const colormap = d3.scaleSequential(d3.interpolatePRGn);

      // CCG layer
      svg
        .append("g")
        .attr("class", "ccg-layer")
        .attr("stroke", "#000")
        .selectAll("path")
        .data(__VM.ccg_list)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "none")
        // .attr("fill_pip", (d) => getBorderingColor(d))
        .attr("ccg_id", (d) => d.properties.id)
        .on("click", function (e, d) {
          console.log(d.properties.id);
        });

      // CCG data layer
      const nodes = svg
        .append("g")
        .attr("class", "node-layer")
        // .style("visibility", "hidden")
        .selectAll("rect")
        .data(__VM.ccg_list)
        .enter()
        .append("g");

      nodes
        .append("rect")
        .attr("colormap", (d) => colormap(getIndicatorRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0] - __VM.getHalfNodeSize)
        .attr("y", (d) => path.centroid(d)[1] - __VM.getHalfNodeSize)
        .attr("history", (d) =>
          JSON.stringify([
            [
              path.centroid(d)[0] - __VM.getHalfNodeSize,
              path.centroid(d)[1] - __VM.getHalfNodeSize,
              __VM.node.size,
            ],
          ])
        )
        .attr("id", (d) => d.properties.id)
        // .attr("width", (d) => getIndicatorRate(d))
        // .attr("height", (d) => getIndicatorRate(d))
        .attr("width", __VM.node.size)
        .attr("height", __VM.node.size)
        .attr("stroke", "black")
        .attr("stroke-width", "0.3")
        .attr("fill", (d) => {
          return __VM.colorVariant[__VM.node.color];
        })
        .attr("original_fill", (d) => {
          return __VM.colorVariant[__VM.node.color];
        })
        .on("mouseover", function (e, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `${d.properties.name} <br/>Vaccination Rate: ${getIndicatorRate(
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
          // __VM.setRectColor(this);
          tooltip.style("visibility", "hidden");
        });

      nodes
        .append("circle")
        .attr("class", "centroid-layer")
        .attr("cx", (d) => path.centroid(d)[0])
        .attr("cy", (d) => path.centroid(d)[1])
        .attr("fill", "black")
        .attr("r", 0.5);

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
    },
    removeOverlap(repeat = false) {
      const __VM = this;
      __VM.step.button_disabled = true;

      if (!__VM.node.visibility) {
        __VM.toggleFeatureVisibility("rect");
      }

      // prepration before removing overlaps
      if (!repeat) {
        __VM.setNodeSize(__VM.node.size, __VM.node.size + __VM.node.sizeStep);
      }

      // preparation before redrawing nodes and edges
      d3.selectAll(".river-edge > path").remove();

      // prepare an array for webcola
      const nodeToORA = Array.from(
        d3.selectAll(".node-layer > g > rect")._groups[0]
      ).map((r) => {
        r = d3.select(r);

        const x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = __VM.node.size,
          h = __VM.node.size;

        return new cola.Rectangle(x, x + w, y, y + h);
      });

      // remove overlaps
      cola.removeOverlaps(nodeToORA);

      const timer = 20 * __VM.timer * __VM.node.size;

      // draw river crossing edges
      for (let [i, node] of d3
        .selectAll(".node-layer > g > rect")
        ._groups[0].entries()) {
        // redraw nodes using new coordinates

        node = d3.select(node);

        const x_new = nodeToORA[i].x;
        const y_new = nodeToORA[i].y;

        node
          .attr("stroke", () => {
            let res = "black";

            if (node.attr("nodeXCount")) {
              res = "blue";
            }

            if (node.attr("riverX")) {
              res = "red";
            }

            if (node.attr("nodeXCount") && node.attr("riverX")) {
              res = "purple";
            }

            return res;
          })
          .attr("stroke-width", () => {
            return node.attr("nodeXCount") || node.attr("riverX")
              ? __VM.node.nodeX.stroke_width
              : "0.3";
          })
          //.attr("fill", __VM.colorVariant[__VM.node.color])
          .transition()
          .attr("x", x_new)
          .attr("y", y_new);

        const new_position = [x_new, y_new, __VM.node.size];

        __VM.moveCentroid(node, new_position);
        __VM.testRiverCross(node, new_position);
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

      const crossingCount = d3.selectAll(`.river-crossing-path`)._groups[0]
        .length;

      __VM.delay(timer * 1.1).then(() => {
        if (crossingCount > 0) {
          if (__VM.iteration.current >= __VM.iteration.limit) {
            __VM.updateLog(
              `Overlap removal iteration: ${__VM.iteration.current} stopped, iteration limit of ${__VM.iteration.limit} reached. \n`
            );

            __VM.iteration.current = 0;
            __VM.delay(20 * __VM.timer * __VM.node.size).then(() => {
              __VM.deriveCorridor();
            });
          } else {
            __VM.updateLog(
              `Overlap removal iteration: ${__VM.iteration.current}, finished with ${crossingCount} nodeX. \n`
            );

            __VM.iteration.current++;
            __VM.removeOverlap(true);
          }
        } else {
          __VM.updateLog(
            `Overlap removal iteration: ${__VM.iteration.current} finished, no more nodeX. \n`
          );

          __VM.iteration.current = 0;
          __VM.step.button_disabled = false;

          if (repeat && __VM.step.continous) {
            __VM.removeOverlap();
          }
        }
      });
    },
    deriveCorridor() {
      const __VM = this;

      let nodes = d3
        .selectAll(`#map rect[nodeXCount="${__VM.iteration.limit + 1}"]`)
        ._groups[0].entries();

      const timer = 100 * __VM.timer;

      for (let [i, node] of nodes) {
        // redraw nodes using new coordinates

        node = d3.select(node);

        const history = __VM.getNodeHistory(node);

        const previous = history[1];
        const current = [
          Number(node.attr("x")),
          Number(node.attr("y")),
          __VM.node.size,
        ];

        const sizeDiff = previous[2] - current[2];

        const derivePoint = (previous, current, length) => {
          const dx = current[0] - previous[0] + sizeDiff;
          const dy = current[1] - previous[1] + sizeDiff;

          if (__VM.debug) {
            d3.selectAll(".debug").remove();

            __VM.svg
              .append("circle")
              .attr("class", "debug")
              .attr("cx", previous[0] + previous[2] / 2)
              .attr("cy", previous[1] + previous[2] / 2)
              .attr("p", previous[2])
              .attr("r", 0.5)
              .attr("fill", "red");

            __VM.svg
              .append("circle")
              .attr("class", "debug")
              .attr("cx", current[0] + current[2] / 2)
              .attr("cy", current[1] + current[2] / 2)
              .attr("p", current[2])
              .attr("r", 0.5)
              .attr("fill", "green");

            __VM.svg
              .append("circle")
              .attr("class", "debug")
              .attr(
                "cx",
                previous[0] +
                  previous[2] / 2 +
                  (dx / Math.sqrt(dx ** 2 + dy ** 2)) * length
              )
              .attr(
                "cy",
                previous[1] +
                  previous[2] / 2 +
                  (dy / Math.sqrt(dx ** 2 + dy ** 2)) * length
              )
              .attr("p", current[2])
              .attr("r", 0.5)
              .attr("fill", "purple");
          }
          return [
            previous[0] +
              previous[2] / 2 +
              (dx / Math.sqrt(dx ** 2 + dy ** 2)) * length -
              __VM.getHalfNodeSize,
            previous[1] +
              previous[2] / 2 +
              (dy / Math.sqrt(dx ** 2 + dy ** 2)) * length -
              __VM.getHalfNodeSize,
          ];
        };

        const deriveParallelEdge = (start, end, distance) => {
          const x_diff = start[0] - end[0] + sizeDiff;
          const y_diff = start[1] - end[1] + sizeDiff;

          const scale = distance / Math.sqrt(x_diff ** 2 + y_diff ** 2);
          const [dx, dy] = [
            -y_diff * scale + __VM.getHalfNodeSize,
            x_diff * scale + __VM.getHalfNodeSize,
          ];

          return [
            [dx + start[0], dy + start[1]],
            [dx + end[0], dy + end[1]],
          ];
        };

        const next = derivePoint(previous, current, __VM.corridor.length);

        const p1 = deriveParallelEdge(previous, next, __VM.node.size / 2);
        const p2 = deriveParallelEdge(previous, next, -__VM.node.size / 2);

        const corridor = d3.line()([p1[0], p1[1], p2[1], p2[0], p1[0]]);

        d3.select(".corridor").remove();

        __VM.svg
          .append("path")
          .attr("d", corridor)
          .attr("class", "corridor")
          .attr("stroke", "blue")
          .attr("stroke-width", "1")
          .attr("fill", "none");

        const moveNodeInCorridor = (node, position_diff) => {
          const history = __VM.getNodeHistory(node);

          let newPos;

          const x_c = Number(node.attr("x"));
          const y_c = Number(node.attr("y"));

          if (position_diff) {
            newPos = [x_c + position_diff[0], y_c + position_diff[1]];
          } else {
            const x = Number(history[1][0]);
            const y = Number(history[1][1]);

            newPos = derivePoint(
              [x, y, Number(history[1][2])],
              [x_c, y_c, __VM.node.size],
              Math.hypot(x - x_c, y - y_c) * 2
            );

            // reset stalemate fill color
            node.attr("fill", node.attr("original_fill"));
          }

          node.transition().attr("x", newPos[0]).attr("y", newPos[1]);

          newPos[2] = __VM.node.size;
          __VM.moveCentroid(node, newPos);

          __VM.testRiverCross(node, newPos);

          // set stroke color for nodeC
          if (node.attr("nodeXCount")) {
            node.attr("stroke", "blue");
          } else {
            node.attr("stroke", "pink");
          }

          return [newPos[0] - x_c + sizeDiff, newPos[1] - y_c + sizeDiff];
        };

        const position_diff = moveNodeInCorridor(node);

        // here we can derive the bounding box of the corridor to reduce the number of nodes to be checked
        for (let [i, node_local] of d3
          .selectAll(".node-layer > g > rect")
          ._groups[0].entries()) {
          node_local = d3.select(node_local);

          // do not move the node if it's being moved by its own corridor
          if (node_local.attr("fill") === "blue") {
            continue;
          }

          const x_in = Number(node_local.attr("x")) + __VM.getHalfNodeSize;
          const y_in = Number(node_local.attr("y")) + __VM.getHalfNodeSize;

          if (pip.isInside([x_in, y_in], corridor)) {
            moveNodeInCorridor(node_local, position_diff);
          }
        }

        __VM.delay(timer).then(() => {
          // d3.select(".corridor").remove();
        });
      }
      __VM.delay(timer).then(() => {
        // __VM.removeOverlap(true);
        __VM.step.button_disabled = false;
      });
    },
    // write new position into history, and check if the node crossed a river
    testRiverCross(node, current) {
      const __VM = this;

      const previous = __VM.getNodeHistory(node)[0];
      const sizeDiff = previous[2] - current[2];

      __VM.writeNodeHistory(node, current);

      const checkIntersect = (line) => {
        let intersect;
        for (const river of Object.keys(__VM.river.rivers)) {
          const river_path = flattener.flatten_path(
            document.querySelector(`#${river}`).getPathData(),
            [
              __VM.river.rivers[river].translate.finalX,
              __VM.river.rivers[river].translate.finalY,
            ]
          );

          intersect = findPathIntersections(river_path, line, true);

          if (intersect) {
            if (__VM.debug) {
              d3.selectAll(".river-crossing-path").remove();

              __VM.svg
                .append("path")
                .attr("class", "river-crossing-path")
                .attr("d", line)
                .attr("stroke", "red")
                .attr("stroke-width", "1")
                .attr("fill", "none");
            }

            __VM.river.rivers[river].translate.x +=
              current[0] - previous[0] + sizeDiff;
            __VM.river.rivers[river].translate.y +=
              current[1] - previous[1] + sizeDiff;

            break;
          }
        }

        return intersect;
      };

      const riverCrossingLine = d3.line()([
        [previous[0] + previous[2] / 2, previous[1] + previous[2] / 2],
        [current[0] + current[2] / 2, current[1] + current[2] / 2],
      ]);

      const intersect = checkIntersect(riverCrossingLine);

      // move node back
      if (intersect) {
        const nodeXCount =
          Number(node.attr("nodeXCount")) > 0
            ? Number(node.attr("nodeXCount")) + 1
            : 1;

        node
          .attr("stroke", "blue")
          .attr("stroke-width", __VM.node.nodeX.stroke_width)
          .attr("nodeXCount", nodeXCount)
          .transition()
          .attr("x", previous[0])
          .attr("y", previous[1]);

        __VM.moveCentroid(node, previous);

        __VM.writeNodeHistory(node, previous);

        // d3.select(`.river-edge`)
        //   .append("path")
        //   .attr(
        //     "d",
        //     d3.line()([
        //       [previous[0] + previous[2] / 2, previous[1] + previous[2] / 2],
        //       [current[0] + current[2] / 2, current[1] + current[2] / 2],
        //     ])
        //   )
        //   .attr("stroke", "black")
        //   .attr("stroke-width", "1px")
        //   .attr("fill", "none")
        //   .attr("marker-end", "url(#arrow)");

        if (nodeXCount > __VM.iteration.limit) {
          // a stalemate nodeX
          node.attr("fill", "blue");
          node.attr("nodeXCount", __VM.iteration.limit + 1);
        } else {
          // reset fill color for non-stalemate nodeX
          node.attr("fill", node.attr("original_fill").trim());
        }
      } else {
        if (node.attr("nodeXCount")) {
          node.attr("nodeXCount", 0);
        }
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
    setNodeSize(current, next, uniformed = false) {
      const __VM = this;
      __VM.node.previousSize = current;
      __VM.node.size = Number(next);
      __VM.node.nodeSizeUniformed = uniformed;

      if (__VM.node.nodeSizeUniformed) {
        next = 10;
      }

      const sizeDiff = (next - current) / 2;

      d3.selectAll(".node-layer > g > rect")
        .attr("width", next)
        .attr("height", next)
        .transition()
        .attr("x", function () {
          return Number(d3.select(this).attr("x")) - sizeDiff;
        })
        .attr("y", function () {
          return Number(d3.select(this).attr("y")) - sizeDiff;
        });
    },
    setRectColor(singleRect) {
      const __VM = this;
      const changeColor = (r, color) => {
        d3.select(r).attr("fill", color);
      };

      if (__VM.node.nodeMapToColor) {
        if (singleRect) {
          changeColor(singleRect, d3.select(singleRect).attr("colormap"));
        } else {
          d3.selectAll(".node-layer > g> rect")._groups[0].forEach((r) => {
            changeColor(r, __VM.colorVariant[__VM.node.color]);
          });

          __VM.node.nodeMapToColor = false;
        }
      } else {
        if (singleRect) {
          changeColor(singleRect, __VM.colorVariant[__VM.node.color]);
        } else {
          d3.selectAll(".node-layer > g > rect")._groups[0].forEach((r) => {
            const colormap = d3.select(r).attr("colormap");
            changeColor(r, colormap);
          });

          __VM.node.nodeMapToColor = true;
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
        let points = topojson.mesh(
          __VM.shapefile,
          __VM.shapefile.objects[river]
        ).coordinates;

        points = [].concat(...points).sort(([a, b], [c, d]) => {
          return c - a;
        });

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

        const res = [];

        let current = __VM.river.rivers[river].start;
        res.push(current);
        for (let i = 0; i < resolution.length; i++) {
          resolution.splice(
            resolution.findIndex((p) => p.toString() === current.toString()),
            1,
            [0, 0]
          );

          const distance = (p) =>
            Math.sqrt(
              Math.pow(current[0] - p[0], 2) + Math.pow(current[1] - p[1], 2)
            );

          const closest = resolution.reduce((a, b) =>
            distance(a) < distance(b) ? a : b
          );

          const closest_index = resolution.findIndex(
            (p) => p.toString() === closest.toString()
          );
          resolution.splice(closest_index, 1, [0, 0]);

          if (closest.toString() !== "0,0") {
            if (distance(closest) < 15 || river === "trent") {
              res.push(closest);
              current = closest;
            }
          }
        }

        __VM.river.rivers[river].resolution = res;

        d3.selectAll(`.${river} .river *`).remove();

        const river_layer = d3.select(`.${river} .river`);

        river_layer
          .append("path")
          .attr("id", `${river}`)
          .attr("d", d3.line()(res))
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("stroke-width", `${__VM.river.width}px`)
          .attr("fill", "none");

        river_layer
          .selectAll("circle")
          .data(res)
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

      __VM.mapNodeColorToRegion();
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

        const size = __VM.node.size;

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

          for (const [i, node] of d3
            .selectAll(".node-layer > g > rect")
            ._groups[0].entries()) {
            const inside = pip.isInside(
              [d3.select(node).attr("x"), d3.select(node).attr("y")],
              crossedRegion
            );
            if (inside) {
              d3.select(node)
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
    updateLog(content) {
      this.log += content;
      const ta_log = document.querySelector("#ta_log");
      ta_log.scrollTop = ta_log.scrollHeight;
    },
    mapNodeColorToRegion() {
      d3.selectAll(".river-region").remove();

      const __VM = this;
      __VM.region.thames = [];

      const thamesRes = __VM.river.rivers.thames.resolution;
      const trentRes = __VM.river.rivers.trent.resolution;
      const ouseRes = __VM.river.rivers.ouse.resolution;

      Object.keys(__VM.river.rivers).forEach((river) => {
        if (river === "thames") {
          __VM.region.thames = [];
          __VM.region.thames.push(...thamesRes);

          const first = thamesRes[0];
          const last = thamesRes[thamesRes.length - 1];

          const width = 0;
          const height = 50;

          __VM.region.thames.push([last[0] - width, last[1]]);
          __VM.region.thames.push([last[0] - width, last[1] + height]);
          __VM.region.thames.push([first[0] + width, first[1] + height]);
          __VM.region.thames.push([first[0] + width, first[1]]);
          __VM.region.thames.push(first);
        }

        if (river === "trent") {
          __VM.region.trent = [];
          __VM.region.trent.push(...trentRes);

          const first = trentRes[0];
          const last = trentRes[trentRes.length - 1];

          const width = 0;
          const height = -50;

          __VM.region.trent.push([last[0] - width, last[1]]);
          __VM.region.trent.push([last[0] - width, last[1] + height]);
          __VM.region.trent.push([first[0] + width, first[1] + height]);
          __VM.region.trent.push([first[0] + width, first[1]]);
          __VM.region.trent.push(first);
        }

        if (river === "ouse") {
          __VM.region.ouse = [];
          __VM.region.ouse.push(...ouseRes);

          const first = ouseRes[0];
          const trentFirst = trentRes[0];
          const last = ouseRes[ouseRes.length - 1];
          const trentLast = trentRes[trentRes.length - 1];

          const width = 20;

          __VM.region.ouse.push([last[0] - width, last[1]]);
          __VM.region.ouse.push([trentLast[0] - width, last[1]]);
          __VM.region.ouse.push(...trentRes.reverse());
          __VM.region.ouse.push([first[0] + width, trentFirst[1]]);
          __VM.region.ouse.push([first[0] + width, first[1]]);
          __VM.region.ouse.push(first);
        }

        __VM.svg
          .append("path")
          .attr("class", "river-region")
          .attr("d", d3.line()(__VM.region[river]))
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("stroke-width", "2px")
          .attr("fill", "none");
      });

      __VM.runPIP();
    },
    runPIP() {
      const __VM = this;
      Object.keys(__VM.river.rivers).forEach((river) => {
        for (let [i, node] of d3
          .selectAll(".node-layer > g > rect")
          ._groups[0].entries()) {
          node = d3.select(node);

          if (__VM.isInRiverZone(node, river)) {
            node.attr("fill", __VM.colorVariant[river]);
            node.attr("original_fill", __VM.colorVariant[river]);
            node.attr("river", river);
          }
        }
      });
    },
    isInRiverZone(node, river) {
      const __VM = this;
      return pip.isInside(
        [
          // TODO remove all dependancy on half node size
          Number(node.attr("x")) + __VM.getHalfNodeSize,
          Number(node.attr("y")) + __VM.getHalfNodeSize,
        ],
        d3.line()(__VM.region[river])
      );
    },
    moveCentroid(node, position) {
      node
        .select(function () {
          return this.nextElementSibling;
        })
        .transition()
        .attr("cx", position[0] + position[2] / 2)
        .attr("cy", position[1] + position[2] / 2);
    },
    writeNodeHistory(node, position) {
      const __VM = this;
      let history = __VM.getNodeHistory(node);

      // only write a new history when the position is different
      if (history[0].toString() === position.toString()) {
        return;
      }

      history.unshift(position);

      while (history.length > 4) {
        history.pop();
      }

      node.attr("history", JSON.stringify(history));
    },
    getNodeHistory(node) {
      return JSON.parse(node.attr("history"));
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
  data() {
    return {
      step: {
        button_disabled: false,
        continous: true,
      },
      iteration: { current: 0, limit: 1 }, // limit - number of iterations before hit a stalemate
      timer: 10,
      log: "",
      debug: true,
      corridor: {
        length: 30,
      },
      centroid: {
        visibility: true,
      },
      node: {
        nodeSizeUniformed: false,
        nodeMapToColor: false,
        visibility: true,
        color: "success",
        previousSize: 0,
        size: 5,
        maxSize: 20,
        sizeStep: 0.25,
        nodeX: {
          stroke_width: "0.7",
        },
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
        width: 1,
        spacing: 200,
        color: "info",
        rivers: {
          thames: {
            visibility: true,
            color: "thames",
            name: "Thames",
            translate: {
              x: 0,
              y: 0,
              finalX: 0,
              finalXOld: 0,
              finalY: 0,
              finalYOld: 0,
            },
            start: [479.02905797094195, 425.36659340425064],
          },
          trent: {
            visibility: true,
            color: "trent",
            name: "Trent",
            translate: {
              x: 0,
              y: 0,
              finalX: 0,
              finalXOld: 0,
              finalY: 0,
              finalYOld: 0,
            },
            start: [421.57027396650403, 285.2932749819865],
          },
          ouse: {
            visibility: true,
            color: "ouse",
            name: "Ouse",
            translate: {
              x: 0,
              y: 0,
              finalX: 0,
              finalXOld: 0,
              finalY: 0,
              finalYOld: 0,
            },
            start: [463.77093643287986, 338.09757337526446],
          },
        },
      },
      ccg: { border: false, visibility: true, color: "dark" },
      region: { thames: [] },
      colorVariant: {
        primary: "rgb(2, 117, 216)",
        info: "rgb(91, 192, 222)",
        success: "rgb(92, 184, 92, 45%)",
        warning: "rgb(240, 173, 78)",
        danger: "rgb(217, 83, 79)",
        thames: "rgb(20, 84, 140, 45%)",
        trent: "rgb(240, 173, 78, 45%)",
        ouse: "	rgb(132, 196, 224, 45%)",
        blueRegion: "#ba68c8",
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
    getHalfNodeSize: function () {
      return this.node.size / 2;
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

    __VM.indicators = await d3.json(`/data/cardiovascular_00754.json`);

    __VM.shapefile = await d3.json(`/data/ccg_rivers.json`);

    __VM.ccg_list = [];
    __VM.ccg_list.push(
      ...topojson
        .feature(__VM.shapefile, __VM.shapefile.objects.CCG)
        .features.filter((e) => e.geometry && e.geometry.type)
    );

    // __VM.river_list = [];
    // __VM.river_list.push(
    //   ...topojson
    //     .feature(__VM.shapefile, __VM.shapefile.objects.river)
    //     .features.filter((e) => e.geometry && e.geometry.type)
    // );

    this.init();
    this.node.nodeSizeUniformed = false;
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

.btn-thames {
  color: #fff !important;
  background-color: rgb(20, 84, 140) !important;
  border-color: rgb(20, 84, 140) !important;
}

.btn-outline-thames {
  color: rgb(20, 84, 140) !important;
  border-color: rgb(20, 84, 140) !important;
}

.btn-trent {
  color: #fff !important;
  background-color: rgb(240, 173, 78) !important;
  border-color: rgb(240, 173, 78) !important;
}

.btn-outline-trent {
  color: rgb(240, 173, 78) !important;
  border-color: rgb(240, 173, 78) !important;
}

.btn-ouse {
  color: #fff !important;
  background-color: rgb(132, 196, 224) !important;
  border-color: rgb(132, 196, 224) !important;
}

.btn-outline-ouse {
  color: rgbrgb(132, 196, 224) !important;
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
