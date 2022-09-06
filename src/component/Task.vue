<!-- NHS Nottingham and Nottinghamshire CCG E38000243 -->
<template>
  <b-container fluid>
    <b-row id="row-task" style="display:none">
      <b-col cols="6">
        <div>
          <svg id="choropleth-layer" viewBox="0,0,800,800" stroke-linejoin="round" stroke-linecap="round">
            <rect width="800" height="800" style="fill: none; stroke-width: 4; stroke: rgb(43, 222, 221)" />
            <rect width="100%" height="100%" fill="none" pointer-events="all"></rect>
            <g id="choropleth-map"></g>
          </svg>
        </div>
      </b-col>
      <b-col cols="6">
        <div>
          <svg id="base-layer" viewBox="0,0,800,800" stroke-linejoin="round" stroke-linecap="round">
            <rect width="800" height="800" style="fill: none; stroke-width: 4; stroke: rgb(43, 222, 221)" />
            <rect width="100%" height="100%" fill="none" pointer-events="all"></rect>
            <g id="map"></g>
          </svg>
        </div>
      </b-col>
    </b-row>
    <b-row class="my-3 instruction">
      <b-col cols="8" class="mx-auto">
        <b-row>
          <b-col cols="12">
            <b-card header-bg-variant="primary" header-text-variant="white" header="Instructions" header-tag="h2"
              align="left">
              <b-card-text>
                <p>In this task, you are required to select <span class="text-info"><b>{{ this.target }}</b></span> in
                  the
                  cartogram on the right. <span class="text-info"><b>{{ this.target }}</b></span> will be blinking in
                  the
                  choropleth map on the left. Both visualizations will be shown after the task begins. There is no time
                  limit for this task, but <span class="text-danger"><b>you
                      only have one chance</b></span> to click on one square.
                </p>

                Steps:
                <ul>
                  <li>Click on the cartogram to choose the square that you think represents <span
                      class="text-info"><b>{{ this.target }}</b></span>.</li>
                  <li>Upon clicking, your answer will be shown on the screen, and the visualizations will disappear.
                  </li>
                  <li>Your answer will be automatically copied to your clipboard.
                  </li>
                  <li>Return to the survey form, and paste your answer there.</li>
                  <li>Close this page and proceed to the next question.</li>
                </ul>
                <div align="center">

                  When you are done reading the instructions, click
                  <b-button id="btn-begin" variant="primary" v-on:click="showTask()" disabled>{{ beginBtnText }}
                  </b-button> to start the task.
                </div>
              </b-card-text>
            </b-card>



            <b-row class="mx-auto mt-5">
              <b-col cols="2">
                <label>Your answer:</label>
              </b-col>
              <b-col cols="8">
                <b-input-group>
                  <b-form-textarea v-model="answer"
                    placeholder="Your answer will appear here after clicking on the cartogram." disabled rows="2"
                    no-resize>
                  </b-form-textarea>

                  <b-input-group-append
                    v-show="this.answer !== '' && this.verifyAnswer !== '' && !(this.answer === this.verifyAnswer)">
                    <b-button variant="info" :click="copyToClipboard(answer)">Copy</b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>
            </b-row>

            <div class="mt-5" align="center">
              <h4 v-show="this.answer !== '' && this.verifyAnswer !== '' && this.answer === this.verifyAnswer">
                <b-badge variant="success">Answer copied</b-badge>, you can now paste it in the survey form.
              </h4>

              <h4 v-show="this.answer !== '' && this.verifyAnswer !== '' && !(this.answer === this.verifyAnswer)">
                <b-badge variant="danger">Answer mismatch</b-badge>, please copy it manually via the <code>copy</code>.
              </h4>
            </div>
          </b-col>
        </b-row>

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
  name: "Task",
  props: ["blink", "target", "sizeMap", "colorMap", "allowRiverCross", "showRiver"],
  methods: {
    initChoropleth() {
      const __VM = this;

      d3.selectAll("#choropleth-map").remove();

      const svg = d3.select("#choropleth-layer").append("g").attr("id", "choropleth-map").attr("transform", "translate(-186,-183) scale(1.6)");

      svg
        .append("g")
        .attr("class", "choropleth")
        .attr("stroke", "#000")

      const colormap = d3.scaleSequential(d3.interpolateRdYlGn);
      d3.select(".choropleth > path").remove();
      // CCG layer


      const blink = () => {
        d3.select(`path[ccg_id='${__VM.blink}']`)
          .transition()
          .duration(1000)
          .style("fill", "rgb(0,0,0)")
          .transition()
          .duration(1000)
          .style("fill", (d) => colormap(1 - __VM.getNodeSize(d, "color")))
          .on("end", blink);
      }

      // tooltip
      // eslint-disable-next-line no-unused-vars
      const tooltip = d3.select(".tooltip")

      d3.select(".choropleth").selectAll("path")
        .data(__VM.CCG)
        .enter()
        .append("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", d3.geoPath())
        .attr("fill", "none")
        // .attr("fill_pip", (d) => getBorderingColor(d))
        .attr("ccg_id", (d) => d.properties.id)
        .attr("fill", (d) => {
          return colormap(1 - __VM.getNodeSize(d, "color"))
        })
        .on("mouseover", function (e, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `Name: ${d.properties.name} <br/> ` +
              `ID: ${d.properties.id} <br/> ` +
              `Population: ${d.properties.population} <br/> ` +
              `Cardiovascular: ${d.properties.cardiovascular} per 100,000 <br/> ` +
              `Alcohol: ${d.properties.alcohol} per 100,000<br/> ` +
              `Range: ${__VM.getNodeSize(d, "size").toFixed(2)}%`
            );

        })
        .on("mousemove", function (e) {
          return tooltip
            .style("top", e.pageY - 20 + "px")
            .style("left", e.pageX + 20 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        }).on("click", function (e, d) {
          console.log(d.properties.name, d.properties.id, __VM.env);
        });
      blink()

      const river_layer = d3.select("#choropleth-map").append("g").attr("class", "rivers");
      for (const river of Object.keys(__VM.river.rivers)) {
        const r = river_layer.append("g").attr("class", `${river}`);
        r.append("g").attr("class", "river");
      }

      __VM.adjustRiver();
    },
    init() {
      const __VM = this;

      __VM.countdown();

      d3.selectAll("#map").remove();

      __VM.svg = d3.select("#base-layer").append("g").attr("id", "map").attr("transform", "translate(-186,-183) scale(1.6)");

      const svg = __VM.svg;

      // tooltip
      // eslint-disable-next-line no-unused-vars
      const tooltip = d3.select(".tooltip");

      const path = d3.geoPath();

      const colormap = d3.scaleSequential(d3.interpolateRdYlGn);

      // CCG data layer
      const nodes = svg
        .append("g")
        .attr("class", "node-layer")
        // .style("visibility", "hidden")
        .selectAll("rect")
        .data(__VM.CCG)
        .enter()
        .append("g");

      nodes
        .append("rect")
        .attr("x", (d) => {
          const centroid = path.centroid(d);

          __VM.node.history[d.properties.id].insertLast(
            new Point(centroid[0], centroid[1], __VM.getNodeSize(d, "size"))
          );

          return centroid[0] - __VM.getNodeSize(d, "size") / 2;
        })
        .attr("y", (d) => path.centroid(d)[1] - __VM.getNodeSize(d, "size") / 2)
        .attr("id", (d) => d.properties.id)
        .attr("width", (d) => __VM.getNodeSize(d, "size"))
        .attr("height", (d) => __VM.getNodeSize(d, "size"))
        .attr("rate", (d) => 1 + __VM.getNodeSize(d, "size"))
        // .attr("width", __VM.node.size)
        // .attr("height", __VM.node.size)
        .attr("stroke", "black")
        .attr("stroke-width", "0.3")
        // .attr("fill", __VM.colorVariant[__VM.node.color])
        // .attr("original_fill", __VM.colorVariant[__VM.node.color])
        .attr("colormap", (d) => colormap(__VM.getNodeSize(d, "size")))
        .attr("fill", (d) => colormap(1 - __VM.getNodeSize(d, "color")))
        .attr("original_fill", (d) => colormap(1 - __VM.getNodeSize(d, "color")))
        .on("mouseover", function (e, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `Name: ${d.properties.name} <br/> ` +
              `ID: ${d.properties.id} <br/> ` +
              `Population: ${d.properties.population} <br/> ` +
              `Cardiovascular: ${d.properties.cardiovascular} per 100,000 <br/> ` +
              `Alcohol: ${d.properties.alcohol} per 100,000<br/> ` +
              `Range: ${__VM.getNodeSize(d, "size").toFixed(2)}%`
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
        }).on("click", function (e, d) {
          if (__VM.answer === "") {
            __VM.setAnswer(`${d.properties.name}, ${d.properties.id}`);

            d3.select(`path[ccg_id='${__VM.blink}']`)
              .transition()
              .duration(1000)
              .style("fill", "rgb(0,0,0)")
              .transition()
              .duration(1000)
              .style("fill", (d) => colormap(1 - __VM.getNodeSize(d, "color")))
              .on("end", "");

          }
          console.log(d.properties.name, d.properties.id);
        });

      nodes
        .append("circle")
        .attr("class", "centroid-layer")
        .attr("cx", (d) => path.centroid(d)[0])
        .attr("cy", (d) => path.centroid(d)[1])
        .attr("ox", (d) => path.centroid(d)[0])
        .attr("oy", (d) => path.centroid(d)[1])
        .attr("fill", "black")
        .attr("r", 0.5);

      // original river layer
      const river_layer = svg.append("g").attr("class", "river-layer");
      for (const river of Object.keys(__VM.river.rivers)) {
        const r = river_layer.append("g").attr("class", `${river}`);
        r.append("g").attr("class", "river");
        r.append("g").attr("class", "river-edge");
        __VM.river.rivers[river].translate = {
          x: 0,
          y: 0,
          finalX: 0,
          finalXOld: 0,
          finalY: 0,
          finalYOld: 0,
          nodeXCount: 0,
        };
      }
      __VM.adjustRiver();
      __VM.iteration = { current: 0, limit: 1, count: 0 };

      __VM.removeOverlap();
    },
    initCCG() {
      const __VM = this;
      const path = d3.geoPath();

      const colormap = d3.scaleSequential(d3.interpolateRdYlGn);
      d3.select(".choropleth-layer > path").remove();
      // CCG layer

      d3.select(".choropleth-layer").selectAll("path")
        .data(__VM.CCG)
        .join("path")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", path)
        .attr("fill", "none")
        // .attr("fill_pip", (d) => getBorderingColor(d))
        .attr("ccg_id", (d) => d.properties.id)
        .attr("fill", (d) => __VM.node.visibility ? "none" : colormap(1 - __VM.getNodeSize(d, "color")))
        .on("click", function (e, d) {
          console.log(d.properties.id);
        });

    },
    getNodeSize(d, type) {
      const __VM = this;

      let current, range, minimum, map;
      if (type === "size") {
        map = __VM.node.nodeSizeMappedTo;
      } else if (type === "color") {
        map = __VM.node.nodeColorMappedTo;
        if (map === "none") {
          return 1;
        }
      }

      switch (map) {
        case "uniform":
          current = 1;
          range = 1;
          minimum = 0;
          break;
        default:
          current = d.properties[map];
          range = __VM.indicators[map].max - __VM.indicators[map].min;
          minimum = __VM.indicators[map].min;
          break;
      }

      const result = Math.abs(current - minimum) / range
      return result;
    },
    runFNOR() {
      const __VM = this;
      // prepare an array for webcola
      const nodes = Array.from(
        d3.selectAll(".node-layer > g > rect")._groups[0]
      ).map((r) => {
        r = d3.select(r);

        const x = Number(r.attr("x"));
        const y = Number(r.attr("y"));
        const w = Number(r.attr("width"));

        return new cola.Rectangle(x, x + w, y, y + w);
      });

      // remove overlaps
      cola.removeOverlaps(nodes);

      return nodes;
    },
    async removeOverlap(firstPass = true, repeat = false) {
      const __VM = this;

      __VM.step.button_disabled = true;

      // prepration before removing overlaps
      if (!repeat) {
        // increase node size
        __VM.increaseNodeSize();
        __VM.iteration.count++
      }

      // preparation before redrawing nodes and edges
      d3.selectAll(".river-edge > path").remove();

      // get nodes with ORAed positions via FNOR
      const nodes = __VM.runFNOR();

      // the first pass of ORA is to translate rivers
      for (let [i, node] of d3
        .selectAll(".node-layer > g > rect")
        ._groups[0].entries()) {
        // redraw nodes using new coordinates

        node = d3.select(node);

        const nodeSize = Number(node.attr("width"));

        const p_new = new Point(nodes[i].x, nodes[i].y, nodeSize, true);

        // assgin node border color
        node
          .attr("stroke", () => {
            let res = "black";

            // if (node.attr("nodeXCount")) {
            //   res = "blue";
            // }

            // if (node.attr("riverX")) {
            //   res = "red";
            // }

            // if (node.attr("nodeXCount") && node.attr("riverX")) {
            //   res = "purple";
            // }

            return res;
          })
          .attr("stroke-width", "0.3");
        // .attr("fill", __VM.colorVariant[__VM.node.color])

        if (firstPass) {
          __VM.testRiverCross(node, p_new, true);
        } else {
          __VM.moveNode(node, p_new);
          __VM.testRiverCross(node, p_new, !__VM.getRiverTranslationNoCrossing);

        }
      }

      if (firstPass) {
        if (__VM.getRiverTranslationNoCrossing) {
          if (!__VM.getRiverTranslationStatic) {
            __VM.calculateRiverTranslation();
            for await (const river of Object.keys(__VM.river.rivers)) {
              __VM.moveRiver(river);
              await __VM.detectRiverXNodes(river);
            }
          }
        }
      }

      // get the count with nodeX (node crossings)
      const overlapCount = d3
        .selectAll(`#map rect[nodeXCount="${__VM.iteration.limit}"]`)
        ._groups[0].length;

      await __VM.delay(__VM.timer).then(async () => {
        if (overlapCount > 0) {
          if (__VM.iteration.current >= __VM.iteration.limit) {
            await __VM.processStalemate();
            await __VM.removeOverlap(false, true);
          } else {
            __VM.iteration.current++;
            await __VM.removeOverlap(false, true);
          }
        } else if (firstPass) {
          // the first pass of ORA is to translate rivers
          // after the first pass, the second pass is to move nodes
          await __VM.removeOverlap(false, false);
        } else {
          __VM.iteration.current = 0;
          __VM.step.button_disabled = false;
          d3.selectAll(".crossedArea").remove();
        }
      });


      await __VM.delay(__VM.timer).then(async () => {
        if (__VM.checkAvgNodeSize() > __VM.node.maxSize) {
          __VM.iteration.current = 0;
          __VM.step.button_disabled = false;
          d3.selectAll(".crossedArea").remove();

          // if (!__VM.getRiverTranslationNoCrossing) {
          //   __VM.drawCrossedNode();
          // }

          return
        } else {
          if (__VM.step.continuous) {
            await __VM.removeOverlap();
          }
        }
      });
    },
    async processStalemate() {
      const __VM = this;
      const nodes = d3
        .selectAll(`#map rect[nodeXCount="${__VM.iteration.current}"]`)
        ._groups[0].entries();

      __VM.iteration.current = 0;

      for await (let [i, node] of nodes) {
        // redraw nodes using new coordinates

        node = d3.select(node);

        const nodeSize = Number(node.attr("width"));

        const history = __VM.getNodeHistory(node);

        const p_current = history.last.value;
        const p_previous = history.secondLast.value;
        const sizeDiff = p_previous.size - p_current.size;


        // used in derivedPoints
        let tempPoint = new Point(1000, 1000, nodeSize);

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
                tempPoint = new Point(400, 340, nodeSize);
              } else {
                tempPoint = new Point(500, 350, nodeSize);
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
                tempPoint = new Point(400, 300, nodeSize);
              } else {
                tempPoint = new Point(480, 415, nodeSize);
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
                tempPoint = new Point(370, 270, nodeSize);
              } else {
                tempPoint = new Point(430, 305, nodeSize);
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
                  __VM.river.rivers[XRiver].section[1],
                  __VM.river.rivers[XRiver].end
                );
              // use the right reference point based on the side
              if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
                tempPoint = new Point(460, 280, nodeSize);
              } else {
                tempPoint = new Point(400, 350, nodeSize);
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
                tempPoint = new Point(415, 285, nodeSize);
              } else {
                tempPoint = new Point(300, 350, nodeSize);
                tempPoint = new Point(400, 150, nodeSize);
              }
            }

            break;

          // thames has 1 section
          case "thames":
            pSlope = -1 / __VM.river.rivers[XRiver].slope;
            if (river_vector.is_upper_side(node, __VM.colorVariant[XRiver])) {
              pSlope = 1 / __VM.river.rivers[XRiver].slope;
              tempPoint = new Point(420, 460, nodeSize);
            } else {
              tempPoint = new Point(500, 500, nodeSize);
            }

            break;
        }

        tempPoint.y = pSlope * tempPoint.x - p_previous.x + p_previous.y;

        const derivePoint = (previous, current, length) => {
          const dx = current.x - previous.x + sizeDiff;
          const dy = current.y - previous.y + sizeDiff;
          const p_next = new Point(
            previous.x + (dx / Math.sqrt(dx ** 2 + dy ** 2)) * length,
            previous.y + (dy / Math.sqrt(dx ** 2 + dy ** 2)) * length,
            nodeSize
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
            -y_diff * scale + nodeSize / 2,
            x_diff * scale + nodeSize / 2,
          ];

          return [
            new Point(dx + start.x, dy + start.y, nodeSize),
            new Point(dx + end.x, dy + end.y, nodeSize),
          ];
        };

        const derivedPoint = derivePoint(
          p_previous,
          tempPoint,
          Math.abs(nodeSize * 3) > 25 ? 25 : nodeSize * 3
        );

        const parallelEdge1 = deriveParallelEdge(
          p_previous,
          derivedPoint,
          nodeSize / 2
        );
        const parallelEdge2 = deriveParallelEdge(
          p_previous,
          derivedPoint,
          -nodeSize / 2
        );

        const corridor = d3.line()([
          parallelEdge1[0].coordRect,
          parallelEdge1[1].coordRect,
          parallelEdge2[1].coordRect,
          parallelEdge2[0].coordRect,
          parallelEdge1[0].coordRect,
        ]);

        d3.select(".corridor").remove();

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
            nodeSize
          );
          __VM.moveNode(node, p_next);
          if (!self) {
            __VM.testRiverCross(node, p_next, false);
          }
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
          nodeSize
        );
        const position_diff = [
          (tempVector.x - parallelEdge1[0].x) / 2,
          (tempVector.y - parallelEdge1[0].y) / 2,
        ];

        // move the node itself
        moveNodeInCorridor(node, position_diff, true);
        node.attr("fill", node.attr("original_fill"));
        node.attr("nodeXCount", null);

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

        __VM.delay(__VM.timer).then(() => {
          d3.select(".corridor").remove();
        });
      }

    },
    checkIntersect(line) {
      const __VM = this;
      const result = [false, ""];

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

          break;
        }
      }

      return result;
    },
    // check if the node crossed a river
    // if firstPass is true, compute the average distance for translating rivers, and do not move nodes
    testRiverCross(node, p, firstPass) {
      const __VM = this;

      let crossed = false;

      let p_last = __VM.getNodeHistory(node).last.value;

      if (p_last.x === p.x && p_last.y === p.y && __VM.getNodeHistory(node).size > 1) {
        p_last = __VM.getNodeHistory(node).secondLast.value;
      }

      const sizeDiff = p_last.size - p.size;

      // crossings[0] is the number of river crossings
      // crossings[1] is the river name
      const crossings = __VM.checkIntersect(
        d3.line()([
          [p_last.x, p_last.y],
          [p.x, p.y],
        ])
      );

      // if there is a crossing
      if (crossings[0] > 0) {
        crossed = true;
        if (!__VM.getRiverTranslationNoCrossing) {
          node.attr("crossed", true);
          return
        }

        // if it's the first pass, calculate the distance for river translations
        // do not move the node after testing
        if (firstPass) {
          const river = crossings[1];
          // add the distance for compouting average river translation distance
          const { translate } = __VM.river.rivers[river];

          let x = p.x - p_last.x + sizeDiff;
          let y = p.y - p_last.y + sizeDiff;

          if (river === "thames") {
            if (river_vector.is_upper_side(node, __VM.colorVariant[river])) {
              x = -x;
              y = -y;
            }
          } else {
            if (!river_vector.is_upper_side(node, __VM.colorVariant[river])) {
              x = -Math.abs(x);
              y = -Math.abs(y);
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
              // node.attr("fill", "blue");
              node.attr("nodeXCount", __VM.iteration.limit);
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
      return crossed;
    },
    setNodeSize(current, next, uniformed = false) {
      const __VM = this;
      __VM.node.previousSize = current;
      __VM.node.size = Number(next);
      // __VM.node.nodeSizeUniformed = uniformed;

      // if (__VM.node.nodeSizeUniformed) {
      //   next = 10;
      // }

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
    increaseNodeSize() {
      const __VM = this;

      const conpensation = 1;

      d3.selectAll(".node-layer > g > rect")
        .attr("width", function () {
          return (
            Number(d3.select(this).attr("width")) +
            __VM.node.sizeStep + Number(d3.select(this).attr("rate") - conpensation)
          );
        })
        .attr("height", function () {
          return (
            Number(d3.select(this).attr("height")) +
            __VM.node.sizeStep + Number(d3.select(this).attr("rate") - conpensation)
          );
        })
        .attr("x", function () {
          return Number(
            d3.select(this).attr("x") -
            (__VM.node.sizeStep + Number(d3.select(this).attr("rate") - conpensation)) / 2
          );
        })
        .attr("y", function () {
          return Number(
            d3.select(this).attr("y") -
            (__VM.node.sizeStep + Number(d3.select(this).attr("rate") - conpensation)) / 2
          );
        });
    },
    setNodeColor(singleRect) {
      const __VM = this;
      const changeColor = (r, color) => {
        d3.select(r).attr("fill", color);
      };

      if (singleRect) {
        changeColor(singleRect, __VM.colorVariant[__VM.node.color]);
      } else {
        d3.selectAll(".node-layer > g > rect")._groups[0].forEach((r) => {
          const colormap = d3.select(r).attr("colormap");
          changeColor(r, colormap);
        });
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

      // d3.selectAll(".river > circle").attr(
      //   "r",
      //   1
      // );
    },
    adjustRiver() {
      const __VM = this;

      Object.keys(__VM.river.rivers).forEach((river) => {
        let points = topojson.mesh(
          __VM.shapefile,
          __VM.shapefile.objects[river]
        ).coordinates;

        points = [].concat(...points);

        const spacing = Number(__VM.river.spacing);

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

        const river_layer = d3.selectAll(`.${river} .river`);

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
          .attr("class", "vertex-layer")
          .attr("visibility", __VM.vertex.visibility ? "visible" : "hidden")
          .attr("fill", "red")
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => d[1])
          .attr("r", 1);
        if (!__VM.getRiverTranslationStatic) {
          __VM.moveRiver(river);
        }
      });
      __VM.mapNodeColorToRegion();
    },
    calculateRiverTranslation() {
      const __VM = this;
      for (const river of Object.keys(__VM.river.rivers)) {
        const { translate } = __VM.river.rivers[river];
        const { x, y, nodeXCount } = translate;

        if (nodeXCount > 0) {
          // old x,y are used to draw riverX regions
          translate.finalXOld = translate.finalX;
          translate.finalYOld = translate.finalY;

          const xSign = x > 0 ? 1 : -1;
          const ySign = y > 0 ? 1 : -1;


          translate.finalX +=
            Math.abs(x / nodeXCount) > __VM.river.translation.limit
              ? xSign * __VM.river.translation.limit
              : x / nodeXCount;

          if (Math.abs(translate.finalX) > __VM.river.translation.limit * 5) {
            translate.finalX = translate.finalXOld
          }

          translate.finalY +=
            Math.abs(y / nodeXCount) > __VM.river.translation.limit
              ? ySign * __VM.river.translation.limit
              : y / nodeXCount;

          if (Math.abs(translate.finalY) > __VM.river.translation.limit * 5) {
            translate.finalY = translate.finalYOld
          }

          translate.x = 0;
          translate.y = 0;
          translate.nodeXCount = 0;
        }

        __VM.river.rivers[river].translate = translate;
      }
    },
    async detectRiverXNodes(river) {
      const __VM = this;

      const { resolution, translate } = __VM.river.rivers[river];

      if (
        translate.finalX !== translate.finalXOld ||
        translate.finalY !== translate.finalYOld
      ) {
        const resCurrent = [];
        const resOld = [];

        resolution.forEach((r) => {
          resCurrent.push([r[0] + translate.finalX, r[1] + translate.finalY]);
          resOld.push([
            r[0] + translate.finalXOld,
            r[1] + translate.finalYOld,
          ]);
        });

        // draw river crossed areas
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

            let x = translate.finalX - translate.finalXOld;
            let y = translate.finalY - translate.finalYOld;

            let nodeRiver = node.attr("river")

            if (!nodeRiver) {
              switch (river) {
                case "thames":
                  if (x > 0) {
                    x = 0
                  }
                  if (y > 0) {
                    y = 0
                  }
                  break;
                default:
                  if (x < 0) {
                    x = 0
                  }
                  if (y < 0) {
                    y = 0
                  }
                  break;
              }
            }

            const p_next = new Point(
              p_current.x + x,
              p_current.y + y,
              Number(__VM.node.size)
            );

            // no need to test river crossing here as it's simply impossible to do so
            __VM.moveNode(node, p_next);
          }
        }
      }
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
        }

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
            // node.attr("fill", __VM.colorVariant[river]);
            // node.attr("original_fill", __VM.colorVariant[river]);
            node.attr("river", river);
          }
        }
      });
    },
    isInRiverZone(node, river) {
      const __VM = this;
      return pip.isInside(
        [
          Number(node.attr("x")) + Number(node.attr("width")) / 2,
          Number(node.attr("y")) + Number(node.attr("width")) / 2,
        ],
        d3.line()(__VM.region[river])
      );
    },
    moveNode(node, p) {
      const last = this.node.history[node.attr("id")].last.value;

      const width = Number(node.attr("width")) / 2;

      // only insert when the position is not the same as the last one
      if (!_.isEqual(p, last)) {
        this.node.history[node.attr("id")].insertLast(p);

        node.attr("x", p.x - width).attr("y", p.y - width);

        // move the centroid
        node
          .select(function () {
            return this.nextElementSibling;
          })
          .attr("cx", p.x)
          .attr("cy", p.y);
      }
    },
    moveRiver(river) {
      const __VM = this;

      d3.select(`#base-layer .${river} .river`)
        .attr(
          "transform",
          `translate(${__VM.river.rivers[river].translate.finalX},${__VM.river.rivers[river].translate.finalY})`
        );
    },
    getNodeHistory(node) {
      return this.node.history[node.attr("id")];
    },
    drawCrossedNode() {
      d3.selectAll(".crossed-line").remove();
      for (let [i, node] of d3
        .selectAll(".node-layer > g > rect[crossed='true']")
        ._groups[0].entries()) {

        node = d3.select(node);
        const nodeX = Number(node.attr("x"));
        const nodeY = Number(node.attr("y"));
        const nodeSize = Number(node.attr("width"));

        const g = node.select(function () { return this.parentNode; })

        g.append("path")
          .attr("class", "crossed-line")
          .attr("d", d3.line()([
            [nodeX, nodeY],
            [nodeX + nodeSize, nodeY + nodeSize],
          ]))
          .attr("stroke", "red")
          .attr("stroke-width", "1px")
          .attr("fill", "none");

        g.append("path")
          .attr("class", "crossed-line")
          .attr("d", d3.line()([
            [nodeX + nodeSize, nodeY],
            [nodeX, nodeY + nodeSize],
          ]))
          .attr("stroke", "red")
          .attr("stroke-width", "1px")
          .attr("fill", "none");
      }
    },
    checkAvgNodeSize() {
      const __VM = this;

      const nodes = d3.selectAll(".node-layer > g > rect")._groups[0]

      let size = 0;
      for (let [i, node] of nodes.entries()) {
        size += Number(d3.select(node).attr("width"));
      }
      size = size / nodes.length;
      __VM.node.size = size;
      return size;
    },
    async countdown() {
      const __VM = this;

      while (__VM.readPeriod !== 0) {
        await __VM.delay(1000);
        __VM.readPeriod--
        __VM.beginBtnText = `Begin (${__VM.readPeriod})`;
      }

      __VM.beginBtnText = `Begin`;
      d3.select("#btn-begin").attr("disabled", null).attr("class", "btn btn-primary");
    },
    showTask() {
      const __VM = this;
      __VM.timeTaken = new Date().getTime()

      d3.select("#row-task").attr("style", null);
      d3.select("#btn-begin").style("display", "none")
    },
    async setAnswer(text) {
      const __VM = this;

      __VM.timeTaken = new Date().getTime() - __VM.timeTaken;
      __VM.answer = `${text}, ${__VM.timeTaken}`;

      await __VM.copyToClipboard(text);

      d3.select("#txt-verify").style("display", null)
      d3.select("#row-task").style("display", "none")
    },
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        await this.pasteFromClipboard()
      } catch (err) {
        // do nothing
      }
    },
    async pasteFromClipboard() {
      try {
        this.verifyAnswer = await navigator.clipboard.readText();
      } catch (err) {
        // do nothing
      }
    },
  },
  data() {
    return {
      step: {
        button_disabled: false,
        continuous: true,
      },
      datasets: [
        // Under 75 mortality from cardiovascular disease per 100,000
        "cardiovascular", "population",
        // Emergency admissions for alcohol related liver disease per 100,000
        "alcohol"],
      indicators: {
      },
      iteration: { current: 0, limit: 1, count: 0 }, // limit - number of iterations before hit a stalemate
      timer: 10,
      debug: false,
      corridor: {
        length: 30,
      },
      centroid: {
        visibility: true,
        deltaX: 0,
        deltaY: 0,
      },
      choropleth: {
        visibility: true,
        color: "secondary",
      },
      vertex: {
        visibility: false,
        color: "info",
      },
      metric: {
        visibility: false,
        deltaX: 0,
        deltaY: 0,
      },
      node: {
        nodeSizeMap: [
          { text: "Uniform", value: "uniform" },
        ],
        nodeColorMap: [
          { text: "None", value: "none" },
          { text: "Uniform", value: "uniform" },
        ],
        visibility: true,
        color: "success",
        previousSize: 0,
        size: 1,
        maxSize: 15,
        sizeStep: 0.1,
        nodeX: {
          stroke_width: "1",
        },
        history: {},
      },
      river: {
        translation: {
          limit: 5,
          options: [
            {
              text: "Disallow River Crossing",
              value: "no-crossing",
              disabled: false,
            },
            {
              text: "Disable River Translation",
              value: "static",
              disabled: false,
            },
          ],
        },
        visibility: true,
        width: 5,
        spacing: 200,
        color: "primary",
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
        thames: "rgb(132, 196, 224, 75%)",
        trent: "rgb(132, 196, 224, 75%)",
        ouse: "rgb(132, 196, 224, 75%)",
        // thames: "rgb(20, 84, 140, 75%)",
        // trent: "rgb(240, 173, 78, 75%)",
        // ouse: "rgb(132, 196, 224, 75%)",
        blueRegion: "#ba68c8",
      },
      beginBtnText: "Begin (10)",
      readPeriod: 10,
      timeTaken: 0,
      answer: "",
      verifyAnswer: "",
    };
  },
  computed: {
    getRivers: function () {
      return Object.values(this.river.rivers);
    },
    getRiverTranslationStatic: function () {
      return this.river.translation.checked.includes("static");
    },
    getRiverTranslationNoCrossing: function () {
      return this.river.translation.checked.includes("no-crossing");
    },
  },
  watch: {
    "river.translation.checked": {
      deep: true,
      handler(val) {
        this.river.translation.options[1].disabled = !val.includes("no-crossing");
      },
    },
    "node.visibility": {
      deep: true,
      handler() {
        this.initCCG();
      },
    },
  },
  async mounted() {
    const __VM = this;
    // load shapefile
    // eslint-disable-next-line require-atomic-updates
    __VM.shapefile = await d3.json("/data/ccg_rivers.json");

    // load CCG list
    // eslint-disable-next-line require-atomic-updates
    __VM.CCG = [];
    __VM.CCG.push(
      ...topojson
        .feature(__VM.shapefile, __VM.shapefile.objects.CCG)
        .features.filter((e) => e.geometry && e.geometry.type)
    );
    // load data
    for await (const dataset of __VM.datasets) {
      __VM.indicators[dataset] = {
        min: 0,
        max: 0,
        data: null
      }

      // add dataset tp node mapping options
      __VM.node.nodeSizeMap.push(
        { text: dataset[0].toUpperCase() + dataset.slice(1), value: dataset }
      )
      __VM.node.nodeColorMap.push(
        { text: dataset[0].toUpperCase() + dataset.slice(1), value: dataset }
      )
      // eslint-disable-next-line require-atomic-updates
      __VM.indicators[dataset].data = await d3.csv(`/data/ccg_2020_${dataset}.csv`);

      for await (const ccg of __VM.CCG) {

        if (!__VM.node.history[ccg.properties.id]) {
          __VM.node.history[ccg.properties.id] = new LinkedList();
        }

        let column = "Indicator value";

        switch (dataset) {
          case "population":
            column = "All Ages"
            break;

          default:
            break;
        }

        const count = parseInt(
          __VM.indicators[dataset].data
            .find((d) => d["CCG Code"] === ccg.properties.id)
          [column].replace(/,/g, "")
        );

        if (__VM.indicators[dataset].max === 0 || __VM.indicators[dataset].min === 0) {
          __VM.indicators[dataset].max = count;
          __VM.indicators[dataset].min = count;
        } else {
          if (count > __VM.indicators[dataset].max) {
            __VM.indicators[dataset].max = count;
          }
          if (count < __VM.indicators[dataset].min) {
            __VM.indicators[dataset].min = count;
          }
        }
        ccg.properties[dataset] = count;
      }
    }

    if (process.env.NODE_ENV === "development") {
      d3.select("body")
        .append("div")
        .style("visibility", "hidden")
        .attr("class", "tooltip");
    }

    __VM.node.nodeSizeMappedTo = __VM.sizeMap || 'population';
    __VM.node.nodeColorMappedTo = __VM.colorMap || 'cardiovascular';

    if (process.env.NODE_ENV === "development") {
      __VM.readPeriod = 1;
    }

    __VM.river.translation.checked = [__VM.allowRiverCross === "true" ? "static" : "no-crossing"];

    this.initChoropleth();
    this.init();

    if (__VM.showRiver === "false") {
      d3.selectAll(".rivers, .river-layer")
        .style("visibility", "hidden");
    }
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
  position: absolute;
  z-index: 10;
}
</style>
