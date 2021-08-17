<template>
  <b-container fluid>
    <b-row>
      <b-col cols="8">
        <div id="map"></div>
      </b-col>
      <b-col cols="4">
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
                  <b-button-group vertical>
                    <b-button
                      block
                      :variant="
                        (rect.visibility ? '' : 'outline-') + rect.color
                      "
                      v-on:click="toggleFeatureVisibility('rect')"
                      >Rectangle</b-button
                    >
                    <b-button
                      block
                      :variant="
                        (circle.visibility ? '' : 'outline-') + rect.color
                      "
                      v-on:click="toggleFeatureVisibility('circle')"
                      >Circle</b-button
                    >
                  </b-button-group>
                </td>
                <td>
                  <b-button-group vertical>
                    <b-button
                      :variant="rectOverlapsRemoved ? 'danger' : 'primary'"
                      v-on:click="
                        rectOverlapsRemoved ? init() : removeOverlap('all')
                      "
                      >{{
                        rectOverlapsRemoved ? "Reset" : "Remove"
                      }}
                      overlaps</b-button
                    >

                    <b-button
                      :variant="circleOverlapsRemoved ? 'danger' : 'primary'"
                      v-on:click="
                        circleOverlapsRemoved ? init() : removeOverlap('circle')
                      "
                      >{{ circleOverlapsRemoved ? "Reset" : "Remove" }} circle
                      overlaps</b-button
                    >

                    <b-button
                      :variant="rectSizeUniformed ? 'danger' : 'primary'"
                      v-on:click="setRectSize()"
                      >{{
                        rectSizeUniformed ? "Variable" : "Uniform"
                      }}
                      Size</b-button
                    >

                    <b-button
                      :variant="rectMapToColor ? 'danger' : 'primary'"
                      v-on:click="setRectColor()"
                      >Map to {{ rectMapToColor ? "Size" : "Color" }}</b-button
                    >
                  </b-button-group>
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
                <td>
                  <b-button-group size="sm">
                    <b-button
                      v-for="type in ['state', 'county']"
                      :key="type"
                      :variant="
                        river.simplified === type ? 'danger' : 'primary'
                      "
                      v-on:click="
                        simplifyRiver(river.simplified === type ? null : type)
                      "
                      >{{
                        river.simplified === type
                          ? "Show original rivers"
                          : `Simplify rivers by ${type}`
                      }}</b-button
                    >
                  </b-button-group>
                  <span class="btn btn-dark">
                    <label for="river-width"> Set river thickness </label>
                    <b-form-input
                      id="river-width"
                      v-model="river.width"
                      type="range"
                      min="1"
                      max="10"
                      @change="setRiverWidth()"
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

export default {
  name: "Home",
  methods: {
    async init() {
      const __VM = this;

      __VM.circle.list = [];

      const calculateRectSize = (d) => {
        return getVacRate(d) * 0.2;
      };

      const getVacRate = (d) => {
        const county = __VM.indicators.find(
          (f) => f.FIPS === d.properties.FIPS
        );
        return county ? county.Series_Complete_Pop_Pct : 0;
      };

      d3.selectAll("#map > svg").remove();

      __VM.svg = d3
        .select("#map")
        .append("svg")
        .attr("id", "base-layer")
        .attr("viewBox", [0, 0, 800, 400])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      let svg = __VM.svg;
      svg.call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [800, 400],
          ])
          .scaleExtent([1, 6])
          .on("zoom", zoomed)
      );

      function zoomed({ transform }) {
        svg.attr("transform", transform);
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
        .attr("county_id", (d) => d.properties.id);
      // .on("mouseover", function (e, d) {
      //   console.log(d.properties.id);
      // });

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
        .style("visibility", "hidden")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(__VM.county_list)
        .enter()
        .append("rect")
        .attr("colormap", (d) => colormap(getVacRate(d) / 100))
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("width", (d) => calculateRectSize(d))
        .attr("height", (d) => calculateRectSize(d))
        .attr("stroke", "black")
        .attr("fill", (d) => {
          let state;

          let temp = d.properties.NAME.split(",");

          if (temp.length > 1) {
            state = temp[1].trim();
          } else {
            state = temp[0].trim();
          }

          if (state.includes("Oregon")) {
            return "rgb(2, 117, 216)";
          } else if (state.includes("Washington")) {
            return "rgb(217, 83, 79)";
          } else {
            return __VM.colorVariant[__VM.rect.color];
          }
        })
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

      const line = d3.line();
      // state-simplified river layer
      Object.keys(__VM.river.rivers).forEach((river) => {
        svg
          .append("path")
          .attr(
            "class",
            `state-simplified simplified-river-layer ${river} river-layer`
          )
          .attr(
            "d",
            line(
              __VM.state_list
                .filter(
                  (s) =>
                    s.properties.river.length > 0 &&
                    s.properties.river.includes(river)
                )
                .map((s) => path.centroid(s))
                .sort(([a, b], [c, d]) => {
                  if (river === "missouri") {
                    return a - c;
                  } else {
                    return b - d;
                  }
                })
            )
          )
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("stroke-width", "5px")
          .attr("fill", "none")
          .style("visibility", "hidden");
      });

      // county-simplified river layer
      Object.keys(__VM.river.rivers).forEach((river) => {
        svg
          .append("path")
          .attr(
            "class",
            `county-simplified simplified-river-layer ${river} river-layer`
          )
          .attr(
            "d",
            line(
              __VM.county_list
                .filter(
                  (s) =>
                    s.properties.river.length > 0 &&
                    s.properties.river.includes(river)
                )
                .map((s) => path.centroid(s))
                .sort(([a, b], [c, d]) => {
                  if (river === "missouri") {
                    return a - c;
                  } else {
                    return b - d;
                  }
                })
            )
          )
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("stroke-width", "5px")
          .attr("fill", "none")
          .style("visibility", "hidden");
      });

      // original river layer
      Object.keys(__VM.river.rivers).forEach((river) => {
        svg
          .append("path")
          .attr("class", `original-river-layer ${river} river-layer `)
          .datum(topojson.mesh(__VM.shapefile, __VM.shapefile.objects[river]))
          .attr("stroke-width", "5px")
          .attr("fill", "none")
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("d", path);
      });

      // River bordering county layer
      const circles = svg
        .append("g")
        .attr("class", "circle-layer")
        .attr("stroke", "none")
        .style("visibility", "hidden")
        .selectAll("circle");

      Object.keys(__VM.river.rivers).forEach((river) => {
        const bordering_county_list = __VM.county_list
          .filter(
            (c) =>
              c.properties.river.length > 0 &&
              c.properties.river.includes(river)
          )
          .map((s) => path.centroid(s))
          .sort(([a, b], [c, d]) => {
            console.log([a, b], [c, d]);
            if (river === "missouri") {
              return a - c;
            } else {
              return b - d;
            }
          });

        const riverCircles = circles
          .data(bordering_county_list)
          .enter()
          .append("circle")
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => d[1])
          .attr("r", __VM.circle.size)
          .attr("fill", __VM.colorVariant[river]);

        let links = [];

        __VM.circle.list.push(...riverCircles._groups[0]);

        for (let index = 0; index < bordering_county_list.length - 1; index++) {
          const start = bordering_county_list[index];
          const end = bordering_county_list[index + 1];

          links.push(
            d3.linkHorizontal()({
              source: start,
              target: end,
            })
          );
        }

        svg
          .append("g")
          .attr("class", "river-edge")
          .selectAll("path")
          .data(links)
          .enter()
          .append("path")
          .attr("d", (d) => d)
          .attr("stroke", "black");
      });

      __VM.rect.list = rects._groups[0];
      __VM.rectSizeUniformed = false;
      __VM.rectOverlapsRemoved = false;

      // __VM.circle.list = circles._groups[0];
      __VM.circleOverlapsRemoved = false;
    },
    removeOverlap(type) {
      const __VM = this;

      let data = [];

      // prepare an array for webcola
      const prepareColaRect = (r, i) => {
        r = d3.select(r);

        let isCircle = r.attr("cx") !== null;

        let x = Number(isCircle ? r.attr("cx") : r.attr("x")),
          y = Number(isCircle ? r.attr("cy") : r.attr("y")),
          w = Number(
            isCircle
              ? r.attr("r")
              : __VM.rectSizeUniformed
              ? 10
              : r.attr("width")
          ),
          h = Number(
            isCircle
              ? r.attr("r")
              : __VM.rectSizeUniformed
              ? 10
              : r.attr("height")
          );

        if (isCircle) {
          data[i] = new cola.Rectangle(x - w, x + w, y - h, y + h);
        } else {
          data[i] = new cola.Rectangle(x, x + w, y, y + h);
        }
      };

      if (type === "all") {
        __VM["rect"].list.forEach((r, i) => {
          prepareColaRect(r, i);
        });

        __VM["circle"].list.forEach((r, i) => {
          prepareColaRect(r, i);
        });
      } else {
        __VM[type].list.forEach((r, i) => {
          prepareColaRect(r, i);
        });
      }

      // remove overlaps
      cola.removeOverlaps(data);

      // redraw rects using new coordinates
      const redrawD3Rect = (r, i) => {
        const t = data[i];
        if (d3.select(r).attr("cx") !== null) {
          d3.select(r)
            .transition()
            .duration(10000)
            .attr("cx", t.x)
            .attr("cy", t.y);
        } else {
          d3.select(r)
            .transition()
            .duration(10000)
            .attr("x", t.x)
            .attr("y", t.y);
        }
      };

      if (type === "all") {
        __VM["rect"].list.forEach((r, i) => redrawD3Rect(r, i));
        __VM["circle"].list.forEach((r, i) => redrawD3Rect(r, i));
      } else {
        __VM[type].list.forEach((r, i) => redrawD3Rect(r, i));
      }

      if (type === "all") {
        d3.select("#base-layer").attr("viewBox", [-150, -100, 1200, 700]);
        __VM.rectOverlapsRemoved = true;
        __VM.circleOverlapsRemoved = true;
      } else if (type === "circle") {
        __VM.circleOverlapsRemoved = true;
      } else {
        d3.select("#base-layer").attr("viewBox", [-150, -100, 1200, 700]);
        __VM.rectOverlapsRemoved = true;
      }
    },
    toggleFeatureVisibility(type, name = false) {
      const __VM = this;

      __VM[type].visibility = !__VM[type].visibility;
      let layer = `.${type}-layer`;
      if (type === "river") {
        // toggle the specific river
        if (name) {
          layer = __VM.river.simplified
            ? `.${__VM.river.simplified}-simplified.${name}`
            : `.original-${type}-layer.${name}`;

          __VM[type].rivers[name].visibility =
            !__VM[type].rivers[name].visibility;

          d3.select(layer).style(
            "visibility",
            __VM[type].rivers[name].visibility ? "visible" : "hidden"
          );
        }
        // toggle all rivers
        else {
          layer = __VM.river.simplified
            ? `.${__VM.river.simplified}-simplified`
            : `.original-${type}-layer`;

          Object.values(__VM[type].rivers).forEach(
            (r) => (r.visibility = __VM[type].visibility)
          );
        }
      }
      d3.selectAll(layer).style(
        "visibility",
        __VM[type].visibility ? "visible" : "hidden"
      );
    },
    async setRectSize() {
      const __VM = this;
      __VM.rectSizeUniformed = !__VM.rectSizeUniformed;
      if (__VM.rectSizeUniformed) {
        d3.selectAll(".rect-layer > rect").attr(
          "style",
          "width: 10px !important; height: 10px !important;"
        );

        if (__VM.rectOverlapsRemoved) {
          __VM.removeOverlap("rect");
          d3.select("#base-layer").attr("viewBox", [-400, -150, 1800, 700]);
        }
      } else {
        if (__VM.rectOverlapsRemoved) {
          await __VM.init();
          __VM.removeOverlap("rect");
        }

        d3.selectAll(".rect-layer > rect").attr("style", "");
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
    simplifyRiver(type) {
      const __VM = this;

      __VM.river.simplified = type;

      // hide all rivers first
      d3.selectAll(".river-layer").style("visibility", "hidden");

      // process hidden rivers
      const hidden_rivers = __VM.getRivers
        .filter((r) => !r.visibility)
        .map((n) => `:not(.${n.color})`);

      if (type) {
        d3.selectAll(`.${type}-simplified${hidden_rivers}`).style(
          "visibility",
          "visible"
        );
      } else {
        d3.selectAll(`.original-river-layer${hidden_rivers}`).style(
          "visibility",
          "visible"
        );
        __VM.river.simplified = false;
      }
    },
    setRiverWidth() {
      const __VM = this;
      d3.selectAll(".river-layer").style(
        "stroke-width",
        `${__VM.river.width}px`
      );
    },
  },
  data() {
    return {
      rectOverlapsRemoved: false,
      rectSizeUniformed: false,
      rectMapToColor: false,
      circleOverlapsRemoved: false,
      showBordering: { county: false, state: false },
      rect: { list: [], visibility: false, color: "success", size: 10 },
      circle: { list: [], visibility: false, color: "success", size: 5 },
      river: {
        visibility: true,
        simplified: false,
        width: 5,
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

.btn-group-vertical .btn:not(:last-child) {
  border-bottom: 2px solid white !important;
}

.btn-group .btn:not(:last-child) {
  border-right: 2px solid white !important;
}
</style>
