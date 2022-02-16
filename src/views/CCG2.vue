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
                    :variant="(rect.visibility ? '' : 'outline-') + rect.color"
                    v-on:click="toggleFeatureVisibility('rect')"
                    >Rectangle</b-button
                  > -->

                  <!-- <b-button
                    block
                    :variant="rect.rectSizeUniformed ? 'danger' : 'primary'"
                    v-on:click="setRectSize(!rect.rectSizeUniformed)"
                    >{{ rect.rectSizeUniformed ? "Variable" : "Uniform" }} Rect
                    Size</b-button
                  > -->

                  <!-- <b-button
                    block
                    :variant="rect.rectMapToColor ? 'danger' : 'primary'"
                    v-on:click="setRectColor()"
                    >Map to
                    {{ rect.rectMapToColor ? "Size" : "Color" }}</b-button
                  > -->

                  <b-button block variant="info">
                    Rect size: {{ rect.size
                    }}<b-form-input
                      id="slider-rect-size"
                      :value="rect.size"
                      type="range"
                      min="0.5"
                      :max="rect.maxSize > 0 ? rect.maxSize : 100"
                      step="0.5"
                      @change="updateRectSizeFromInput(rect.size, $event)"
                    ></b-form-input
                  ></b-button>

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

                  <b-row>
                    <b-col sm="5">Max node size:</b-col>
                    <b-col sm="7">
                      <input
                        v-model="rect.maxSize"
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
                    v-model="step.enabled"
                    name="check-button"
                    switch
                  >
                    Step mode enabled: {{ step.enabled }}
                  </b-form-checkbox>

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

      const calculateRectSize = (d) => {
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

      const getBorderingColor = (d) => {
        if (d.properties.river.length > 0) {
          return __VM.colorVariant[
            __VM.river.rivers[d.properties.river[0]].color
          ];
        } else {
          return "none";
        }
      };
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
      const rects = svg
        .append("g")
        .attr("class", "rect-layer")
        // .style("visibility", "hidden")
        .selectAll("rect")
        .data(__VM.ccg_list)
        .enter()
        .append("rect")
        .attr("colormap", (d) => colormap(getIndicatorRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0] - __VM.getHalfRectSize)
        .attr("y", (d) => path.centroid(d)[1] - __VM.getHalfRectSize)
        .attr("history", (d) =>
          JSON.stringify([
            [
              path.centroid(d)[0] - __VM.getHalfRectSize,
              path.centroid(d)[1] - __VM.getHalfRectSize,
            ],
          ])
        )
        .attr("id", (d) => d.properties.id)
        // .attr("width", (d) => getIndicatorRate(d))
        // .attr("height", (d) => getIndicatorRate(d))
        .attr("width", __VM.rect.size)
        .attr("height", __VM.rect.size)
        .attr("stroke", "black")
        .attr("stroke-width", "0.3")
        .attr("fill", (d) => {
          return __VM.colorVariant[__VM.rect.color];
        })
        .attr("original_fill", (d) => {
          return __VM.colorVariant[__VM.rect.color];
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

      // __VM.svg
      //   .append("path")
      //   .attr("class", "river-x")
      //   .attr(
      //     "d",
      //     d3.line()([
      //       [419.1343268883818, 426.38749019878526],
      //       [419.89112153497354, 426.22082353211863],
      //     ])
      //   )
      //   .attr("stroke", "pink")
      //   .attr("stroke-width", "1px")
      //   .attr("fill", "none");

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

      if (!__VM.rect.visibility) {
        __VM.toggleFeatureVisibility("rect");
      }

      // prepration before removing overlaps
      if (!repeat) {
        __VM.rect.previousSize = __VM.rect.size;
        __VM.rect.size = __VM.rect.size + __VM.rect.sizeStep;
        __VM.setRectSize();
      }

      // preparation before redrawing rects and edges
      d3.selectAll(".river-edge > path").remove();

      // prepare an array for webcola
      const nodeToORA = Array.from(
        d3.selectAll(".rect-layer > rect")._groups[0]
      ).map((r) => {
        r = d3.select(r);

        const x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = __VM.rect.size,
          h = __VM.rect.size;

        return new cola.Rectangle(x, x + w, y, y + h);
      });

      // remove overlaps
      cola.removeOverlaps(nodeToORA);

      const timer = 20 * __VM.timer * __VM.rect.size;

      // draw river crossing edges
      for (let [i, rect] of d3
        .selectAll(".rect-layer > rect")
        ._groups[0].entries()) {
        // redraw rects using new coordinates

        rect = d3.select(rect);

        const x_new = nodeToORA[i].x;
        const y_new = nodeToORA[i].y;

        const history = __VM.getRectHistory(rect);

        const x_old = history[0][0];
        const y_old = history[0][1];

        rect
          .attr("stroke", () => {
            let res = "black";

            if (rect.attr("nodeXCount")) {
              res = "blue";
            }

            if (rect.attr("riverX")) {
              res = "red";
            }

            if (rect.attr("nodeXCount") && rect.attr("riverX")) {
              res = "purple";
            }

            return res;
          })
          .attr("stroke-width", () => {
            return rect.attr("nodeXCount") || rect.attr("riverX")
              ? __VM.rect.nodeX.stroke_width
              : "0.3";
          })
          //.attr("fill", __VM.colorVariant[__VM.rect.color])
          .transition()
          .duration(timer)
          .attr("x", x_new)
          .attr("y", y_new);

        __VM.checkNodeX(rect, [x_new, y_new]);

        // if (repeat && rect.attr("id") === "E38000084") {
        //   console.log(x_old !== x_new || y_old !== y_new);
        //   console.log(rect.attr("x"), rect.attr("y"));
        //   console.log(x_new, y_new);
        //   console.log(rect.attr("history"));
        //   console.log(history);
        // }
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

      const edgeCount = d3.selectAll(".river-edge > path")._groups[0].length;

      __VM.delay(timer * 1.1).then(() => {
        if (edgeCount > 0) {
          if (__VM.iteration.current >= __VM.iteration.limit) {
            __VM.updateLog(
              `Overlap removal iteration: ${__VM.iteration.current} stopped, iteration limit of ${__VM.iteration.limit} reached. \n`
            );

            d3.selectAll(".river-edge > path").remove();

            __VM.iteration.current = 0;
            __VM.delay(20 * __VM.timer * __VM.rect.size).then(() => {
              __VM.deriveCorridor();
            });
          } else {
            __VM.updateLog(
              `Overlap removal iteration: ${__VM.iteration.current}, finished with ${edgeCount} nodeX. \n`
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
        }
      });
    },
    deriveCorridor() {
      const __VM = this;

      let rects = d3
        .selectAll(`#map rect[nodeXCount="${__VM.iteration.limit + 1}"]`)
        ._groups[0].entries();

      const timer = 100 * __VM.timer;

      for (let [i, rect] of rects) {
        // redraw rects using new coordinates

        rect = d3.select(rect);

        const history = __VM.getRectHistory(rect);

        const previous = history[1];
        const current = history[0];

        const x_diff = previous[0] - current[0];
        const y_diff = previous[1] - current[1];

        const slope = y_diff / x_diff;

        // draw a line that passes through a given point
        const drawLineFromPoint = (slope, p, distance, sideline = false) => {
          let a, b;

          if (slope === 0) {
            a = [p[0] + Number(sideline ? 0 : distance), p[1]];
            b = [p[0] - distance, p[1]];
          } else if (
            slope === Number.POSITIVE_INFINITY ||
            slope === Number.NEGATIVE_INFINITY
          ) {
            a = [p[0], p[1] + Number(sideline ? 0 : distance)];
            b = [p[0], p[1] - distance];
          } else {
            const dx = distance / Math.sqrt(1 + slope * slope);
            const dy = slope * dx;

            a = [
              p[0] + Number(sideline ? 0 : dx),
              p[1] + Number(sideline ? 0 : dy),
            ];
            b = [p[0] - dx, p[1] - dy];
          }

          // console.log(slope, Math.hypot(a[0] - b[0], a[1] - b[1]));

          return [a, b];
        };

        const pLine = drawLineFromPoint(-1 / slope, current, __VM.rect.size);
        const sideline1 = drawLineFromPoint(
          slope,
          pLine[0],
          __VM.corridor.length,
          true
        );
        const sideline2 = drawLineFromPoint(
          slope,
          pLine[1],
          __VM.corridor.length,
          true
        );

        const corridor = d3.line()([
          pLine[0],
          sideline1[1],
          sideline2[1],
          sideline2[0],
          pLine[0],
        ]);

        __VM.svg
          .append("path")
          .attr("d", corridor)
          .attr("class", "corridor")
          .attr("stroke", "blue")
          .attr("stroke-width", "1")
          .attr("fill", "none");

        const moveRectC = (rect) => {
          const history = __VM.getRectHistory(rect);

          const x = Number(history[0][0]);
          const y = Number(history[0][1]);

          const newPos = drawLineFromPoint(
            slope,
            [x, y],
            __VM.getHalfRectSize
          )[1];

          rect
            .transition()
            //.duration(timer)
            .attr("x", newPos[0])
            .attr("y", newPos[1]);

          __VM.delay(timer).then(() => {
            __VM.checkNodeX(rect, newPos);

            // reset fill color for nodeC
            if (rect.attr("nodeXCount")) {
              rect.attr("stroke", "blue");
            } else {
              rect.attr("stroke", "pink");
            }

            rect.attr("fill", rect.attr("original_fill"));
          });
        };

        moveRectC(rect);

        for (let [i, rect] of d3
          .selectAll(".rect-layer > rect")
          ._groups[0].entries()) {
          rect = d3.select(rect);

          const x_in = Number(rect.attr("x")) + __VM.getHalfRectSize;
          const y_in = Number(rect.attr("y")) + __VM.getHalfRectSize;

          if (pip.isInside([x_in, y_in], corridor)) {
            moveRectC(rect);
          }
        }

        __VM.delay(timer).then(() => {
          d3.select(".corridor").remove();
        });
      }
      __VM.delay(timer).then(() => {
        __VM.step.button_disabled = false;
      });
    },
    // write new position into history, and check if the node crossed a river
    checkNodeX(rect, new_position) {
      const __VM = this;

      const x = Number(new_position[0]);
      const y = Number(new_position[1]);

      let history = __VM.getRectHistory(rect);
      if (rect.attr("id") === "E38000084") {
        console.log(history);
      }
      const x_old = Number(history[0][0]);
      const y_old = Number(history[0][1]);

      __VM.writeRectHistory(rect, new_position);
      // if (rect.attr("id") === "E38000084") {
      //   console.log("history", JSON.stringify(history));
      //   console.log("line", `[${x},${y}],[${x_old}, ${y_old}]`);
      //   console.log(
      //     "line centroid",
      //     `[${x + __VM.getHalfRectSize},${
      //       y + __VM.getHalfRectSize
      //     }],[${x_old}, ${y_old}]`
      //   );
      //   const thames =
      //     "M479.02905797094195,425.36659340425064L470.49523857146625,425.5436279311971L462.1011939917252,427.2689644226242L455.1200084006535,426.134743216086L449.0832472672484,425.6696525097013L444.7842271359499,425.9397051779247L440.12632571073806,425.85268820705267L438.05614729953277,426.26376837979274L436.3372947865795,427.02591702122317L433.9800113402436,426.4318011511317L432.7711480344303,426.3867923730945L431.414954513221,426.389792958297L430.60652717745836,426.91189478352885L431.1807372477197,428.7362505866379L430.99563005401706,429.801458333519L429.3258876128624,429.51940332448567L424.64154230283594,430.1675297282218L422.99446604866534,430.14352504660195L421.37383367930937,428.76025526825777L417.9587948403868,426.389792958297L413.86377039194434,426.0177203931892L412.39424593581504,422.8190965673434L412.0542531310551,422.804093641331L409.7876344326551,422.64506262559945L406.7201437941539,423.39520892621994L403.87175962983133,425.24957058135385L402.67800711534073,423.551239356749L403.3013272574007,422.92411704943027L401.7146941685208,426.5878315816608L398.20521288383156,426.85788424988414L390.7971474378945,423.71327095768305L387.1932237074386,419.5904668894728L383.8839604077748,419.2033913983526L385.85214097755204,416.1728003438458L384.39394961491473,414.9065533883984L382.64865321714683,413.31924381628545L380.01182013134155,414.6214977941626L377.9756410006123,416.74891270272235L375.33880791480703,416.53587115334614L373.3177395754005,417.16899463106984L369.72514893843663,417.0909794158053L366.7256568608874,417.6550894338719L364.99924895227275,417.8561286424382L363.8810503943955,417.4180432028758L362.78929572133285,418.3242199340254L361.6068763003342,418.552264409414L360.02402090928496,418.43224100131476L358.2031705549037,418.975346922964L356.32187703523175,419.50344991860084L353.9381497040812,419.5814651338653L349.86201374479197,418.78631005520765";
      //   const line = d3.line()([
      //     [x + __VM.getHalfRectSize, y + __VM.getHalfRectSize],
      //     [x_old, y_old],
      //   ]);
      //   const intersectPoints = findPathIntersections(thames, line);
      //   console.log("checkNodeX intersectPoints", intersectPoints);
      // }

      const riverCrossingLine = d3.line()([
        [x + __VM.getHalfRectSize, y + __VM.getHalfRectSize],
        [x_old, y_old],
      ]);

      const checkIntersect = (line) => {
        let intersectPoints = [];
        for (const river of Object.keys(__VM.river.rivers)) {
          const river_path = flattener.flatten_path(
            document.querySelector(`#${river}`).getPathData(),
            [
              __VM.river.rivers[river].translate.finalX,
              __VM.river.rivers[river].translate.finalY,
            ]
          );

          intersectPoints = findPathIntersections(river_path, line);

          if (intersectPoints.length > 0) {
            intersectPoints = [intersectPoints[0].x, intersectPoints[0].y];
            __VM.river.rivers[river].translate.x += x - Number(x_old);
            __VM.river.rivers[river].translate.y += y - Number(y_old);

            d3.select(`.${river} .river-edge`)
              .append("path")
              .attr("d", line)
              .attr("stroke", "black")
              .attr("stroke-width", "1px")
              .attr("fill", "none")
              .attr("marker-end", "url(#arrow)");

            break;
          }
        }

        return intersectPoints;
      };

      const intersectPoint = checkIntersect(riverCrossingLine);

      // move node back
      if (intersectPoint.length > 0) {
        const nodeXCount =
          Number(rect.attr("nodeXCount")) > 0
            ? Number(rect.attr("nodeXCount")) + 1
            : 1;

        rect
          .attr("stroke", "blue")
          .attr("stroke-width", __VM.rect.nodeX.stroke_width)
          .attr("nodeXCount", nodeXCount)
          .transition()
          .duration(__VM.timer * 100)
          .attr("x", x_old)
          .attr("y", y_old);
        __VM.writeRectHistory(rect, [x_old, y_old]);

        if (nodeXCount > __VM.iteration.limit) {
          // a stalemate nodeX
          rect.attr("fill", "blue");
          rect.attr("nodeXCount", __VM.iteration.limit + 1);
        } else {
          // reset fill color for non-stalemate nodeX
          rect.attr("fill", rect.attr("original_fill").trim());
        }
      } else {
        if (rect.attr("nodeXCount")) {
          rect.attr("nodeXCount", 0);
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
    updateRectSizeFromInput(old, current) {
      const __VM = this;
      __VM.rect.previousSize = old;
      __VM.rect.size = Number(current);

      __VM.setRectSize();
    },
    setRectSize(uniformed = false) {
      const __VM = this;
      __VM.rect.rectSizeUniformed = uniformed;
      let size = __VM.rect.size;
      if (__VM.rect.rectSizeUniformed) {
        size = 10;
      }

      const sizeDiff = (__VM.rect.previousSize - size) / 2;

      d3.selectAll(".rect-layer > rect")
        .attr("width", size)
        .attr("height", size)
        .transition()
        .attr("x", function () {
          return Number(d3.select(this).attr("x")) + sizeDiff;
        })
        .attr("y", function () {
          return Number(d3.select(this).attr("y")) + sizeDiff;
        });
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
        for (let [i, rect] of d3
          .selectAll(".rect-layer > rect")
          ._groups[0].entries()) {
          rect = d3.select(rect);

          if (__VM.isInRiverZone(rect, river)) {
            rect.attr("fill", __VM.colorVariant[river]);
            rect.attr("original_fill", __VM.colorVariant[river]);
            rect.attr("river", river);
          }
        }
      });
    },
    isInRiverZone(rect, river) {
      const __VM = this;
      return pip.isInside(
        [
          Number(rect.attr("x")) + __VM.getHalfRectSize,
          Number(rect.attr("y")) + __VM.getHalfRectSize,
        ],
        d3.line()(__VM.region[river])
      );
    },
    writeRectHistory(rect, position) {
      const __VM = this;
      let history = __VM.getRectHistory(rect);

      position[0] = position[0] - __VM.getHalfRectSize;
      position[1] = position[1] - __VM.getHalfRectSize;

      history.unshift(position);

      while (history.length > 4) {
        history.pop();
      }

      rect.attr("history", JSON.stringify(history));
    },
    getRectHistory(rect) {
      const __VM = this;
      return JSON.parse(rect.attr("history")).map((pos) => {
        return [pos[0] + __VM.getHalfRectSize, pos[1] + __VM.getHalfRectSize];
      });
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
  data() {
    return {
      step: {
        button_disabled: false,
        enabled: true,
      },
      iteration: { current: 0, limit: 1 }, // limit - number of iterations before hit a stalemate
      timer: 10,
      log: "",
      corridor: {
        length: 30,
      },
      rect: {
        rectSizeUniformed: false,
        rectMapToColor: false,
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
        success: "rgb(92, 184, 92)",
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
    getHalfRectSize: function () {
      return this.rect.size / 2;
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
    this.rect.rectSizeUniformed = false;
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
