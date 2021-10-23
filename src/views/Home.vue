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
                    :variant="rectSizeUniformed ? 'danger' : 'primary'"
                    v-on:click="setRectSize(!rectSizeUniformed)"
                    >{{ rectSizeUniformed ? "Variable" : "Uniform" }} Rect
                    Size</b-button
                  >

                  <b-button
                    block
                    :variant="rectMapToColor ? 'danger' : 'primary'"
                    v-on:click="setRectColor()"
                    >Map to {{ rectMapToColor ? "Size" : "Color" }}</b-button
                  >

                  <b-button block variant="info">
                    Rect size: {{ rect.size
                    }}<b-form-input
                      id="river-space"
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
                      :variant="rectOverlapsRemoved ? 'danger' : 'primary'"
                      v-on:click="
                        rectOverlapsRemoved ? init() : removeOverlap()
                      "
                      >{{
                        rectOverlapsRemoved ? "Reset" : "Remove"
                      }}
                      overlaps</b-button
                    > -->

                  <b-button block variant="primary" v-on:click="removeOverlap()"
                    >Remove overlaps</b-button
                  >

                  <b-button
                    block
                    v-if="rectOverlapsRemoved"
                    variant="danger"
                    v-on:click="init()"
                    >Reset overlaps</b-button
                  >

                  <b-button block variant="info">
                    Rect Increment: {{ rect.sizeStep
                    }}<b-form-input
                      id="river-space"
                      v-model="rect.sizeStep"
                      type="range"
                      min="0.25"
                      max="10"
                      step="0.25"
                    ></b-form-input
                  ></b-button>
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
                  <span class="btn btn-dark btn-block">
                    <label for="river-width">
                      Set river thickness: {{ river.width }}
                    </label>
                    <b-form-input
                      id="river-width"
                      v-model="river.width"
                      type="range"
                      min="1"
                      max="10"
                      @change="setRiverWidth()"
                    ></b-form-input>
                  </span>

                  <span class="btn btn-info btn-block">
                    <label for="river-space">
                      Set river resolution: {{ river.spacing }}
                    </label>
                    <b-form-input
                      id="river-space"
                      v-model="river.spacing"
                      type="range"
                      min="1"
                      max="100"
                      @change="setRiverResolution()"
                    ></b-form-input>
                  </span>
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
                    :variant="showBordering.county ? 'danger' : 'primary'"
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
                    :variant="showBordering.state ? 'danger' : 'primary'"
                    v-on:click="highlightBorderingRegion('state')"
                    >{{ showBordering.state ? "Hide" : "Show" }} bordering
                    states</b-button
                  >
                </td>
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
        .attr("stroke", "red")
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
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(__VM.county_list)
        .enter()
        .append("rect")
        .attr("colormap", (d) => colormap(getVacRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        // .attr("width", (d) => calculateRectSize(d))
        // .attr("height", (d) => calculateRectSize(d))

        .attr("width", __VM.rect.size)
        .attr("height", __VM.rect.size)
        .attr("stroke", "black")
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

      __VM.setRiverResolution();

      __VM.rectOverlapsRemoved = false;
    },
    async removeOverlap(repeat = false) {
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
          w = Number(__VM.rect.size),
          h = Number(__VM.rect.size);

        const newRect = new cola.Rectangle(x, x + w, y, y + h);

        newRect.ox = x;
        newRect.oy = y;

        data[i] = newRect;
      });

      // remove overlaps
      cola.removeOverlaps(data);

      const timer = 2000 * __VM.rect.size;

      // draw river crossing edges
      for (const [i, rect] of d3
        .selectAll(".rect-layer > rect")
        ._groups[0].entries()) {
        // if node didn't cross a river, redraw rects using new coordinates
        if (!__VM.connectNewOldRiverRect(data[i])) {
          d3.select(rect)
            .transition()
            .duration(timer)
            .attr("x", data[i].x)
            .attr("y", data[i].y)
            .attr("fill", __VM.colorVariant[__VM.rect.color]);
        } else {
          d3.select(rect).attr("fill", "black");
        }
      }

      __VM.setRiverTranslation();

      __VM.rectOverlapsRemoved = true;

      setTimeout(() => {
        __VM.repeatOverlapRemoval();
      }, timer);
    },
    repeatOverlapRemoval() {
      const __VM = this;
      const numEdges = d3.selectAll(".river-edge > path")._groups[0].length;

      if (numEdges > 0) {
        __VM.iteration++;

        console.log(
          `Overlap removal iteration: ${__VM.iteration} finished with ${numEdges} crossing nodes`
        );

        __VM.removeOverlap(true);
      } else {
        console.log(
          `Overlap removal iteration: ${__VM.iteration} finished, no more crossing nodes`
        );

        __VM.iteration = 0;
      }
    },
    connectNewOldRiverRect(rect) {
      const __VM = this;

      if (rect.x !== rect.ox && rect.y !== rect.oy) {
        const line = d3.line()([
          [rect.x + __VM.rect.size / 2, rect.y + __VM.rect.size / 2],
          [rect.ox, rect.oy],
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

            const intersectPoints = findPathIntersections(
              river_path,
              line,
              true
            );

            if (intersectPoints > 0) {
              intersected = true;
              __VM.river.rivers[river].translate.x +=
                Number(rect.x) - Number(rect.ox);
              __VM.river.rivers[river].translate.y +=
                Number(rect.y) - Number(rect.oy);

              river_edge_layer
                .append("path")
                .attr("d", line)
                .attr("stroke", "blue")
                .attr("stroke-width", "1px")
                .attr("fill", "none")
                .attr("marker-start", "url(#arrow)");
            }
          }

          return intersected;
        };

        return checkIntersect(line);
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
      __VM.rectSizeUniformed = uniformed;
      let size = __VM.rect.size;
      if (__VM.rectSizeUniformed) {
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

      if (__VM.rectMapToColor) {
        if (singleRect) {
          changeColor(singleRect, d3.select(singleRect).attr("colormap"));
        } else {
          d3.selectAll(".rect-layer > rect")._groups[0].forEach((r) => {
            changeColor(r, __VM.colorVariant[__VM.rect.color]);
          });

          __VM.rectMapToColor = false;
        }
      } else {
        if (singleRect) {
          changeColor(singleRect, __VM.colorVariant[__VM.rect.color]);
        } else {
          d3.selectAll(".rect-layer > rect")._groups[0].forEach((r) => {
            const colormap = d3.select(r).attr("colormap");
            changeColor(r, colormap);
          });

          __VM.rectMapToColor = true;
        }
      }
    },
    highlightBorderingRegion(type) {
      const __VM = this;

      __VM.showBordering[type] = !__VM.showBordering[type];

      d3.selectAll(`.${type}-layer > path`).each(function (d) {
        return d3.select(this).attr("fill", (d) => {
          return __VM.showBordering[type]
            ? d3.select(this).attr("fill_pip")
            : "none";
        });
      });
    },
    setRiverWidth() {
      const __VM = this;

      d3.selectAll(".river > path").style(
        "stroke-width",
        `${__VM.river.width}px`
      );
    },
    setRiverResolution() {
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
          .attr("stroke-width", "4px")
          .attr("fill", "none");

        river_layer
          .selectAll("circle")
          .data(resolution)
          .enter()
          .append("circle")
          .attr("fill", "red")
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => d[1])
          .attr("r", 4);

        river_layer
          .transition()
          .duration(10000)
          .attr(
            "transform",
            `translate(${__VM.river.rivers[river].translate.finalX},${__VM.river.rivers[river].translate.finalY})`
          );
      });
    },
    setRiverTranslation() {
      const __VM = this;
      for (const river of Object.keys(__VM.river.rivers)) {
        const x = __VM.river.rivers[river].translate.x;
        const y = __VM.river.rivers[river].translate.y;

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

      __VM.setRiverResolution();
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
        arrow = "&#129044;";
      }

      if (arrow === "02") {
        arrow = "&#10132;";
      }

      if (arrow === "10") {
        arrow = "&#129045;";
      }

      if (arrow === "20") {
        arrow = "&#10133;";
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
  },
  data() {
    return {
      iteration: 0,
      rectOverlapsRemoved: false,
      rectSizeUniformed: false,
      rectMapToColor: false,
      showBordering: { county: false, state: false },
      rect: { visibility: true, color: "success", size: 1, sizeStep: 0.5 },
      river: {
        visibility: true,
        width: 5,
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
              finalY: 0,
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
              finalY: 0,
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
              finalY: 0,
            },
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
        mississippi: "rgb(240, 173, 78)",
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
    this.rectSizeUniformed = false;
    this.rectOverlapsRemoved = false;
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
  font-size: 30px;
}
</style>
