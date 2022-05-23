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
                  <b-button
                    block
                    :variant="(node.visibility ? '' : 'outline-') + node.color"
                    v-on:click="toggleFeatureVisibility('node')"
                    >Node</b-button
                  >

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
                    v-on:click="setNodeColor()"
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
                    >
                    </b-form-input>
                  </b-button>

                  <b-button block variant="info">
                    Node size increment: {{ node.sizeStep
                    }}<b-form-input
                      id="slider-node-size"
                      v-model="node.sizeStep"
                      type="range"
                      min="0.25"
                      max="10"
                      step="0.25"
                    ></b-form-input>
                  </b-button>

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
                    v-model="step.continuous"
                    name="check-button"
                    switch
                  >
                    continuous mode: {{ step.continuous }}
                  </b-form-checkbox>

                  <!-- <b-form-checkbox v-model="debug" name="check-button" switch>
                    Debug mode: {{ debug }}
                  </b-form-checkbox> -->

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
                        getRiverTranslation(r.color)[0].toFixed(2) +
                        "," +
                        getRiverTranslation(r.color)[1].toFixed(2)
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
                    >
                    </b-form-input>
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
                      @change="adjustRiver()"
                    ></b-form-input>
                  </b-button>
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
          >
          </b-form-textarea>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// @ is an alias to /src
import _ from "lodash";
import * as d3 from "d3";
import * as pip from "point-in-svg-polygon";
import * as topojson from "topojson-client";
import * as cola from "webcola";
import * as flattener from "../helper/flattener";
import * as river_vector from "../helper/river_vector";
import findPathIntersections from "path-intersection";
import LinkedList from "../model/LinkedList";
import Point from "../model/Point";

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
        .attr("x", (d) => {
          const centroid = path.centroid(d);

          __VM.node.history[d.properties.id].insertLast(
            new Point(centroid[0], centroid[1], __VM.node.size)
          );

          return centroid[0] - __VM.getHalfNodeSize;
        })
        .attr("y", (d) => path.centroid(d)[1] - __VM.getHalfNodeSize)
        .attr("id", (d) => d.properties.id)
        // .attr("width", (d) => getIndicatorRate(d))
        // .attr("height", (d) => getIndicatorRate(d))
        .attr("width", __VM.node.size)
        .attr("height", __VM.node.size)
        .attr("stroke", "black")
        .attr("stroke-width", "0.3")
        .attr("fill", __VM.colorVariant[__VM.node.color])
        .attr("original_fill", __VM.colorVariant[__VM.node.color])
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
          // __VM.setNodeColor(this);
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
        const r = river_layer.append("g").attr("class", `${river}`);
        r.append("g").attr("class", "river");
        r.append("g").attr("class", "river-edge");
      }

      __VM.adjustRiver();
    },
    runFNOR() {
      const __VM = this;
      // prepare an array for webcola
      const nodes = Array.from(
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
      cola.removeOverlaps(nodes);

      return nodes;
    },
    removeOverlap(firstPass = true, repeat = false) {
      const __VM = this;
      __VM.step.button_disabled = true;

      if (!__VM.node.visibility) {
        __VM.toggleFeatureVisibility("rect");
      }

      // prepration before removing overlaps
      if (!repeat) {
        // increase node size
        __VM.setNodeSize(__VM.node.size, __VM.node.size + __VM.node.sizeStep);
      }

      // preparation before redrawing nodes and edges
      d3.selectAll(".river-edge > path").remove();

      // get nodes with ORAed positions via FNOR
      const nodes = __VM.runFNOR();

      const timer = __VM.timer * __VM.node.size;

      // the first pass of ORA is to translate rivers
      for (let [i, node] of d3
        .selectAll(".node-layer > g > rect")
        ._groups[0].entries()) {
        // redraw nodes using new coordinates

        node = d3.select(node);

        const p_new = new Point(nodes[i].x, nodes[i].y, __VM.node.size, true);

        // assgin node border color
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
          .attr("stroke-width", "0.3");
        //.attr("fill", __VM.colorVariant[__VM.node.color])

        if (firstPass) {
          __VM.testRiverCross(node, p_new, true);
        } else {
          __VM.moveNode(node, p_new);
          __VM.testRiverCross(node, p_new, false);
        }
      }

      if (firstPass) {
        __VM.calculateRiverTranslation();
      }

      let translateRiver = firstPass;

      if (__VM.getRiverTranslationRepeat) {
        // if it's a repeating ORA
        if (repeat) {
          //not first iteration
          if (__VM.iteration.current > 0) {
            //if repeat ORA is allowed
            translateRiver = false;
          }
        }
      }

      if (translateRiver) {
        for (const river of Object.keys(__VM.river.rivers)) {
          __VM.moveRiver(river);
          __VM.delay(__VM.timer).then(() => __VM.detectRiverXNodes());
        }
      }

      // get the count with nodeX (node crossings)
      const crossingCount = d3.selectAll(`.river-crossing-path`)._groups[0]
        .length;

      __VM.delay(timer * 1.1).then(() => {
        if (crossingCount > 0) {
          if (__VM.iteration.current >= __VM.iteration.limit) {
            __VM.updateLog(
              `Overlap removal iteration: ${__VM.iteration.current} stopped, iteration limit of ${__VM.iteration.limit} reached. \n`
            );

            __VM.iteration.current = 0;
            __VM.delay(__VM.timer * __VM.node.size).then(() => {
              __VM.processStalemate();
            });
          } else {
            __VM.updateLog(
              `Overlap removal iteration: ${__VM.iteration.current}, finished with ${crossingCount} nodeX. \n`
            );

            __VM.iteration.current++;
            __VM.removeOverlap(false, true);
          }
        } else if (firstPass) {
          // the first pass of ORA is to translate rivers
          // after the first pass, the second pass is to move nodes
          __VM.removeOverlap(false, false);
        } else {
          __VM.updateLog(
            `Overlap removal iteration: ${__VM.iteration.current} finished, no more nodeX. \n`
          );

          __VM.iteration.current = 0;
          __VM.step.button_disabled = false;

          if (__VM.step.continuous & (__VM.node.size < __VM.node.maxSize)) {
            __VM.removeOverlap(true, false);
          }
        }
      });
    },
    processStalemate() {
      const __VM = this;

      let nodes = d3
        .selectAll(`#map rect[nodeXCount="${__VM.iteration.limit + 1}"]`)
        ._groups[0].entries();

      const timer = 10 * __VM.timer;

      for (let [i, node] of nodes) {
        // redraw nodes using new coordinates

        node = d3.select(node);

        const history = __VM.getNodeHistory(node);

        const p_current = history.last.value;
        const p_previous = history.secondLast.value;
        const sizeDiff = p_previous.size - p_current.size;

        // used in derivedPoints
        let tempPoint = new Point(500, 500, __VM.node.size);

        const XRiver = node.attr("XRiver");
        let pSlope;

        // assign pSlope based on the river name
        switch (XRiver) {
          // ouse has 2 sections
          case "ouse":
            // check which section the node is in
            if (
              river_vector.bounding_box(
                __VM.river.rivers[XRiver].start,
                __VM.river.rivers[XRiver].section[0],
                p_current
              )
            ) {
              pSlope =
                -1 /
                river_vector.cal_slope(
                  __VM.river.rivers[XRiver].start,
                  __VM.river.rivers[XRiver].section[0]
                );

              // use the right reference point based on the side
              if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
                tempPoint = new Point(400, 340, __VM.node.size);
              } else {
                tempPoint = new Point(500, 350, __VM.node.size);
              }
            } else {
              pSlope =
                -1 /
                river_vector.cal_slope(
                  __VM.river.rivers[XRiver].section[0],
                  __VM.river.rivers[XRiver].end
                );

              // use the right reference point based on the side
              if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
                tempPoint = new Point(400, 300, __VM.node.size);
              } else {
                tempPoint = new Point(435, 415, __VM.node.size);
              }
            }

            break;

          // trent has 3 sections
          case "trent":
            // check which section the node is in

            if (
              river_vector.bounding_box(
                __VM.river.rivers[XRiver].start,
                __VM.river.rivers[XRiver].section[0],
                p_current
              )
            ) {
              pSlope =
                -1 /
                river_vector.cal_slope(
                  __VM.river.rivers[XRiver].start,
                  __VM.river.rivers[XRiver].section[0]
                );

              // use the right reference point based on the side
              if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
                tempPoint = new Point(370, 270, __VM.node.size);
              } else {
                tempPoint = new Point(430, 305, __VM.node.size);
              }
            } else if (
              river_vector.bounding_box(
                __VM.river.rivers[XRiver].section[0],
                __VM.river.rivers[XRiver].section[1],
                p_current
              )
            ) {
              pSlope =
                -1 /
                river_vector.cal_slope(
                  __VM.river.rivers[XRiver].section[0],
                  __VM.river.rivers[XRiver].section[1]
                );

              // use the right reference point based on the side
              if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
                tempPoint = new Point(360, 280, __VM.node.size);
              } else {
                tempPoint = new Point(400, 350, __VM.node.size);
              }
            } else {
              pSlope =
                -1 /
                river_vector.cal_slope(
                  __VM.river.rivers[XRiver].section[1],
                  __VM.river.rivers[XRiver].end
                );
              // use the right reference point based on the side
              if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
                tempPoint = new Point(415, 285, __VM.node.size);
              } else {
                tempPoint = new Point(300, 350, __VM.node.size);
              }
            }

            break;

          // trent has 1 section
          case "thames":
            pSlope = -1 / __VM.river.rivers[XRiver].slope;

            if (!river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
              tempPoint = new Point(500, 500, __VM.node.size);
            } else {
              tempPoint = new Point(420, 460, __VM.node.size);
            }

            break;
        }

        tempPoint.y = pSlope * (tempPoint.x - p_previous.x) + p_previous.y;

        const derivePoint = (previous, current, length) => {
          const dx = current.x - previous.x + sizeDiff;
          const dy = current.y - previous.y + sizeDiff;
          const p_next = new Point(
            previous.x + (dx / Math.sqrt(dx ** 2 + dy ** 2)) * length,
            previous.y + (dy / Math.sqrt(dx ** 2 + dy ** 2)) * length,
            __VM.node.size
          );

          __VM.debug = false;
          if (__VM.debug) {
            d3.selectAll(".debug").remove();

            __VM.svg
              .append("circle")
              .attr("class", "debug")
              .attr("cx", p_previous.x)
              .attr("cy", p_previous.y)
              .attr("p", p_previous.size)
              .attr("r", 0.5)
              .attr("fill", "red");

            // __VM.svg
            //   .append("circle")
            //   .attr("class", "debug")
            //   .attr("cx", Number(pointC[0]))
            //   .attr("cy", Number(pointC[1]))
            //   .attr("p", current[2])
            //   .attr("r", 0.5)
            //   .attr("fill", "green");
            __VM.svg
              .append("circle")
              .attr("class", "debug")
              .attr("cx", p_next.x)
              .attr("cy", p_next.y)
              .attr("p", current.size)
              .attr("r", 0.5)
              .attr("fill", "purple");

            __VM.svg
              .append("path")
              .attr(
                "d",
                d3.line()([
                  [p_previous.x, p_previous.y],
                  [p_next.x, p_next.y],
                ])
              )
              .attr("class", "debug")
              .attr("stroke", "red")
              .attr("stroke-width", "1")
              .attr("fill", "none");
          }
          return p_next;
        };

        const deriveParallelEdge = (start, end, distance) => {
          const x_diff = start.x - end.x + sizeDiff;
          const y_diff = start.y - end.y + sizeDiff;

          const scale = distance / Math.sqrt(x_diff ** 2 + y_diff ** 2);
          const [dx, dy] = [
            -y_diff * scale + __VM.getHalfNodeSize,
            x_diff * scale + __VM.getHalfNodeSize,
          ];

          return [
            new Point(dx + start.x, dy + start.y, __VM.node.size),
            new Point(dx + end.x, dy + end.y, __VM.node.size),
          ];
        };

        const derivedPoint = derivePoint(
          p_previous,
          tempPoint,
          __VM.corridor.length
        );

        const parallelEdge1 = deriveParallelEdge(
          p_previous,
          derivedPoint,
          __VM.node.size / 2
        );
        const parallelEdge2 = deriveParallelEdge(
          p_previous,
          derivedPoint,
          -__VM.node.size / 2
        );

        const corridor = d3.line()([
          parallelEdge1[0].coordRect,
          parallelEdge1[1].coordRect,
          parallelEdge2[1].coordRect,
          parallelEdge2[0].coordRect,
          parallelEdge1[0].coordRect,
        ]);

        // d3.select(".corridor").remove();

        __VM.svg
          .append("path")
          .attr("d", corridor)
          .attr("class", "corridor")
          .attr("stroke", "blue")
          .attr("stroke-width", "1")
          .attr("fill", "none");

        const moveNodeInCorridor = (node, position_diff, self = false) => {
          let p_next;

          const p_current = __VM.getNodeHistory(node).last.value;

          p_next = new Point(
            p_current.x + position_diff[0],
            p_current.y + position_diff[1],
            __VM.node.size
          );

          __VM.moveNode(node, p_next);
          __VM.testRiverCross(node, p_next, false);

          // set stroke color for nodeC
          if (node.attr("nodeXCount")) {
            node.attr("stroke", "blue");
          } else {
            node.attr("stroke", "pink");
          }

          // returns a vector constant for moving enclosed nodes in the corridor
          return [
            p_next.x - p_current.x + sizeDiff,
            p_next.y - p_current.y + sizeDiff,
          ];
        };

        // a vector for the position diff of n, we use this vector to move all nodes in corridor
        const tempVector = derivePoint(
          parallelEdge1[0],
          parallelEdge1[1],
          __VM.node.size
        );
        const position_diff = [
          (tempVector.x - parallelEdge1[0].x) / 2,
          (tempVector.y - parallelEdge1[0].y) / 2,
        ];
        // move the node itself
        moveNodeInCorridor(node, position_diff, true);
        node.attr("fill", node.attr("original_fill"));
        node.attr("nodeXCount", 0);

        // here we can derive the bounding box of the corridor to reduce the number of nodes to be checked
        for (let [i, node_in_c] of d3
          .selectAll(".node-layer > g > rect")
          ._groups[0].entries()) {
          node_in_c = d3.select(node_in_c);

          // do not move the node if it's being moved by its own corridor

          const p_last = __VM.getNodeHistory(node_in_c).last.value;

          if (pip.isInside([p_last.x, p_last.y], corridor)) {
            // do not move the node in focus itself
            if (node_in_c.attr("nodeXCount") === null) {
              moveNodeInCorridor(node_in_c, position_diff);
            }
          }
        }

        __VM.delay(timer).then(() => {
          d3.select(".corridor").remove();
        });
      }
      __VM.delay(timer).then(() => {
        d3.selectAll(".river-crossing-path").remove();
        __VM.removeOverlap(false, true);
        __VM.step.button_disabled = false;
      });
    },
    // check if the node crossed a river
    // if firstPass is true, compute the average distance for translating rivers, and do not move nodes
    testRiverCross(node, p, firstPass) {
      const __VM = this;

      const p_last = firstPass
        ? __VM.getNodeHistory(node).last.value
        : __VM.getNodeHistory(node).secondLast.value;

      const sizeDiff = p_last.size - p.size;

      const checkIntersect = (line) => {
        let result = [false, ""];
        for (const river of Object.keys(__VM.river.rivers)) {
          const river_path = flattener.flatten_path(
            document.querySelector(`#${river}`).getPathData(),
            [
              __VM.river.rivers[river].translate.finalX,
              __VM.river.rivers[river].translate.finalY,
            ]
          );

          result[0] = findPathIntersections(river_path, line, true);

          if (result[0] > 0) {
            result[1] = river;

            __VM.svg
              .append("path")
              .attr("class", "river-crossing-path")
              .attr("d", line)
              .attr("stroke", "black")
              .attr("stroke-width", "1")
              .attr("fill", "none");
            break;
          }
        }

        return result;
      };

      // crossings[0] is the number of river crossings
      // crossings[1] is the river name
      const crossings = checkIntersect(
        d3.line()([
          [p_last.x, p_last.y],
          [p.x, p.y],
        ])
      );

      // if there is a crossing
      if (crossings[0] > 0) {
        // if it's the first pass, calculate the distance for river translations
        // do not move the node after testing
        if (firstPass) {
          const river = crossings[1];
          // add the distance for compouting average river translation distance
          let { translate } = __VM.river.rivers[river];

          let x = p.x - p_last.x + sizeDiff;
          let y = p.y - p_last.y + sizeDiff;

          if (river === "thames") {
            if (river_vector.is_upper_side(node, __VM.colorVariant[river])) {
              x = -x;
              y = -y;
            }
          } else {
            if (river_vector.is_upper_side(node, __VM.colorVariant[river])) {
              x = -x;
              y = -y;
            }
          }
          translate.x += x;
          translate.y += y;
          translate.nodeXCount += 1;

          __VM.river.rivers[river].translate = translate;
        }

        // not the first pass, move the node
        else {
          // ignore double crossing
          if (crossings[0] % 2 !== 0) {
            const nodeXCount =
              Number(node.attr("nodeXCount")) > 0
                ? Number(node.attr("nodeXCount")) + 1
                : 1;

            node
              .attr("stroke", "blue")
              .attr("nodeXCount", nodeXCount)
              .attr("XRiver", crossings[1]);

            __VM.moveNode(node, p_last);

            if (nodeXCount > __VM.iteration.limit) {
              // a stalemate nodeX
              node.attr("fill", "blue");
              node.attr("nodeXCount", __VM.iteration.limit + 1);

              // calculate the distance between two postitions
            } else {
              // reset fill color for non-stalemate nodeX
              node.attr("fill", node.attr("original_fill").trim());
            }
          }
          // do not move the node
          // reset nodeXCount
          else {
            if (node.attr("nodeXCount")) {
              node.attr("nodeXCount", 0);
              node.attr("XRiver", null);
            }
          }
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

      const sizeDiff = Number((next - current) / 2);

      d3.selectAll(".node-layer > g > rect")
        .attr("width", next)
        .attr("height", next)
        .attr("x", function () {
          return Number(d3.select(this).attr("x")) - sizeDiff;
        })
        .attr("y", function () {
          return Number(d3.select(this).attr("y")) - sizeDiff;
        });
    },
    setNodeColor(singleRect) {
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
    adjustRiver() {
      const __VM = this;

      Object.keys(__VM.river.rivers).forEach((river) => {
        let points = topojson.mesh(
          __VM.shapefile,
          __VM.shapefile.objects[river]
        ).coordinates;

        points = [].concat(...points);

        // sort by x first
        // points = [].concat(...points).sort(([a, b], [c, d]) => {
        //   console.log(a, b, c, d);
        //   return c - a;
        //   // return d - b;
        // });

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
            Math.hypot(current[0] - p[0], current[1] - p[1]);

          const closest = resolution.reduce((a, b) =>
            distance(a) < distance(b) ? a : b
          );

          const closest_index = resolution.findIndex(
            (p) => p.toString() === closest.toString()
          );
          resolution.splice(closest_index, 1, [0, 0]);

          if (closest.toString() !== "0,0") {
            // smoothing the river
            if (distance(closest) > 3) {
              if (river !== "trent" && distance(closest) < 15) {
                res.push(closest);
                current = closest;
              } else if (river === "trent") {
                res.push(closest);
                current = closest;
              }
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
        if (!__VM.getRiverTranslationStatic) {
          __VM.moveRiver(river);
        }
      });
      __VM.mapNodeColorToRegion();
    },
    calculateRiverTranslation() {
      const __VM = this;
      for (const river of Object.keys(__VM.river.rivers)) {
        let { translate } = __VM.river.rivers[river];
        let { x, y, nodeXCount } = translate;

        if (nodeXCount > 0) {
          // old x,y are used to draw riverX regions
          translate.finalXOld = translate.finalX;

          translate.finalYOld = translate.finalY;

          translate.finalX += x / nodeXCount;

          translate.finalY += y / nodeXCount;

          translate.x = 0;
          translate.y = 0;
          translate.nodeXCount = 0;
        }

        __VM.river.rivers[river].translate = translate;
      }
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
          const crossedRegion = d3.line()([
            ...resCurrent,
            ...resOld.reverse(),
            resCurrent[0],
          ]);

          d3.selectAll(`.${river}.crossedArea`).remove();

          d3.select("#map")
            .append("path")
            .attr("class", `${river} crossedArea`)
            .attr("d", crossedRegion)
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("fill", "none");

          for (let [i, node] of d3
            .selectAll(".node-layer > g > rect")
            ._groups[0].entries()) {
            node = d3.select(node);
            const p_current = __VM.getNodeHistory(node).last.value;

            const inside = pip.isInside(
              [p_current.x, p_current.y],
              crossedRegion
            );
            if (inside) {
              node
                .attr("stroke", "red")
                .attr("stroke-width", "0.5")
                .attr("riverX", true);

              // let x, y;

              // if (river === "thames") {

              //   if (!river_vector.is_upper_side(node, __VM.colorVariant[river])) {
              //     x = -translate.finalX;
              //     y = -translate.finalY;

              //     console.log(translate.finalX, translate.finalY);
              //   } else {
              //     x = translate.finalX;
              //     y = translate.finalY;
              //   }
              // } else {
              //   if (river_vector.is_upper_side(node, __VM.colorVariant[river])) {
              //     x = -translate.finalX;
              //     y = -translate.finalY;
              //   } else {
              //     x = translate.finalX;
              //     y = translate.finalY;
              //   }
              // }

              // let p_next = new Point(
              //   p_current.x + x,
              //   p_current.y + y,
              //   __VM.node.size
              // );

              // __VM.moveNode(node, p_next);
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
        let riverVector;
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

          riverVector = d3.line()([
            __VM.river.rivers[river].start,
            __VM.river.rivers[river].end,
          ]);

          // render river vector
          // __VM.svg
          //   .append("path")
          //   .attr("class", "river-vector")
          //   .attr("d", riverVector)
          //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          //   .attr("stroke-width", "2px")
          //   .attr("fill", "none");
        } else if (river === "trent") {
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

          riverVector = d3.line()([
            __VM.river.rivers[river].start,
            __VM.river.rivers[river].section[0],
          ]);

          // render river vector
          // __VM.svg
          //   .append("path")
          //   .attr("class", "river-vector")
          //   .attr("d", riverVector)
          //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          //   .attr("stroke-width", "2px")
          //   .attr("fill", "none");

          // riverVector = d3.line()([
          //   __VM.river.rivers[river].section[0],
          //   __VM.river.rivers[river].section[1],
          // ]);

          // __VM.svg
          //   .append("path")
          //   .attr("class", "river-vector")
          //   .attr("d", riverVector)
          //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          //   .attr("stroke-width", "2px")
          //   .attr("fill", "none");

          // riverVector = d3.line()([
          //   __VM.river.rivers[river].section[1],
          //   __VM.river.rivers[river].end,
          // ]);

          // __VM.svg
          //   .append("path")
          //   .attr("class", "river-vector")
          //   .attr("d", riverVector)
          //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          //   .attr("stroke-width", "2px")
          //   .attr("fill", "none");
        } else if (river === "ouse") {
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

          riverVector = d3.line()([
            __VM.river.rivers[river].start,
            __VM.river.rivers[river].section[0],
          ]);

          // render river vector
          // __VM.svg
          //   .append("path")
          //   .attr("class", "river-vector")
          //   .attr("d", riverVector)
          //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          //   .attr("stroke-width", "2px")
          //   .attr("fill", "none");

          // riverVector = d3.line()([
          //   __VM.river.rivers[river].section[0],
          //   __VM.river.rivers[river].end,
          // ]);

          // __VM.svg
          //   .append("path")
          //   .attr("class", "river-vector")
          //   .attr("d", riverVector)
          //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          //   .attr("stroke-width", "2px")
          //   .attr("fill", "none");
        }

        // render river regions
        // __VM.svg
        //   .append("path")
        //   .attr("class", "river-region")
        //   .attr("d", d3.line()(__VM.region[river]))
        //   .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
        //   .attr("stroke-width", "2px")
        //   .attr("fill", "none");
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
          Number(node.attr("x")) + __VM.getHalfNodeSize,
          Number(node.attr("y")) + __VM.getHalfNodeSize,
        ],
        d3.line()(__VM.region[river])
      );
    },
    moveNode(node, p) {
      const __VM = this;
      __VM.writeNodeHistory(node, p);

      node.attr("x", p.xRect).attr("y", p.yRect);

      // move the centroid
      node
        .select(function () {
          return this.nextElementSibling;
        })
        .attr("cx", p.x)
        .attr("cy", p.y);
    },
    moveRiver(river) {
      const __VM = this;

      d3.select(`.${river} .river`)
        .transition()
        .attr(
          "transform",
          `translate(${__VM.river.rivers[river].translate.finalX},${__VM.river.rivers[river].translate.finalY})`
        );
    },
    writeNodeHistory(node, p) {
      const last = this.node.history[node.attr("id")].last.value;

      // only insert when the position is not the same as the last one
      if (!_.isEqual(p, last)) {
        this.node.history[node.attr("id")].insertLast(p);
      }
    },
    getNodeHistory(node) {
      return this.node.history[node.attr("id")];
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
  data() {
    return {
      step: {
        button_disabled: false,
        continuous: true,
      },
      iteration: { current: 0, limit: 1 }, // limit - number of iterations before hit a stalemate
      timer: 1,
      log: "",
      debug: false,
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
        history: {},
      },
      river: {
        translation: {
          checked: [],
          options: [
            {
              text: "Disable River Translation",
              value: "static",
              disabled: false,
            },
            // {
            //   text: "Repeat River Translation",
            //   value: "repeat",
            //   disabled: false,
            // },
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
              nodeXCount: 0,
            },
            start: [479.02905797094195, 425.36659340425064],
            end: [347.65206051385206, 417.3280256468014],
            slope: 0.06118702598660611,
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
              nodeXCount: 0,
            },
            start: [421.95559914523204, 284.39009883603944],
            end: [341.19219722341234, 322.06244605320074],
            section: [
              [415.1557430500323, 321],
              [364.91991729782876, 345.3079796168287],
            ],
            slope: -1.7862275682486464,
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
              nodeXCount: 0,
            },
            start: [463.77093643287986, 338.09757337526446],
            end: [381.6475632920202, 391.79904674408465],
            section: [[455.1011199115002, 372.2082259570797]],
            slope: -0.6539121728074947,
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
        thames: "rgb(20, 84, 140, 75%)",
        trent: "rgb(240, 173, 78, 75%)",
        ouse: "rgb(132, 196, 224, 75%)",
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

    __VM.ccg_list.forEach((ccg) => {
      __VM.node.history[ccg.properties.id] = new LinkedList();
    });

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
