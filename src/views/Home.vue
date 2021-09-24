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
                  </b-button-group>

                  <span class="btn btn-dark">
                    <label for="river-space"> Set river resolution </label>
                    <b-form-input
                      id="river-space"
                      v-model="river.spacing"
                      type="range"
                      min="1"
                      max="100"
                      @change="setRiverSpacing()"
                    ></b-form-input>
                  </span>
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
                  <b-button-group size="md">
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
import findPathIntersections from "path-intersection";

export default {
  name: "Home",
  methods: {
    async init() {
      const __VM = this;

      __VM.rect.list = [];

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

      function zoomed(event) {
        const { transform } = event;
        d3.select("#map").attr("transform", transform);
        d3.select("#map").attr("stroke-width", 1 / transform.k);
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
        .style("visibility", "hidden")
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

      // original river layer
      Object.keys(__VM.river.rivers).forEach((river) => {
        const data = topojson.mesh(
          __VM.shapefile,
          __VM.shapefile.objects[river]
        );

        svg
          .append("path")
          .attr("class", `original-river-layer ${river} river-layer `)
          .datum(data)
          .attr("stroke-width", "5px")
          .attr("fill", "none")
          .attr("stroke", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("d", path)
          .attr("visibility", "hidden");
      });

      // River bordering county layer
      const circles = svg
        .append("g")
        .attr("class", "circle-layer")
        .attr("stroke", "none")
        .style("visibility", "hidden")
        .selectAll("circle");

      Object.keys(__VM.river.rivers).forEach((river) => {
        const countyListOrdered = __VM.river.rivers[river].countyList;

        const countyCentroidOrdered = __VM.county_list
          .filter(
            (c) =>
              c.properties.river.length > 0 &&
              c.properties.river.includes(river)
          )
          .sort((a, b) => {
            return countyListOrdered.indexOf(a.properties.id) >
              countyListOrdered.indexOf(b.properties.id)
              ? 1
              : -1;
          })
          .map((s) => path.centroid(s));

        __VM.river.rivers[river].links = [];
        for (let index = 0; index < countyCentroidOrdered.length - 1; index++) {
          __VM.river.rivers[river].links.push(
            d3.linkHorizontal()({
              source: countyCentroidOrdered[index],
              target: countyCentroidOrdered[index + 1],
            })
          );
        }

        const river_rects = svg
          .append("g")
          .attr("stroke", "none")
          .selectAll("rect")
          .data(countyCentroidOrdered)
          .enter()
          .append("rect")
          .attr("class", `${river}-rect-layer`)
          .attr("x", (d) => d[0] - __VM.rect.size / 2)
          .attr("y", (d) => d[1] - __VM.rect.size / 2)
          .attr("width", __VM.rect.size)
          .attr("height", __VM.rect.size)
          .attr("fill", __VM.colorVariant[river]);

        __VM.svg
          .append("g")
          .attr("class", "river-edge")
          .selectAll("path")
          .data(__VM.river.rivers[river].links)
          .enter()
          .append("path")
          .attr("d", (d) => d)
          .attr("stroke", "black")
          .attr("stroke-width", "2");

        // comment out so they stay static
        // __VM.rect.list.push(...river_rects._groups[0]);
      });

      __VM.rect.list.push(...rects._groups[0]);
      __VM.rectSizeUniformed = false;
      __VM.rectOverlapsRemoved = false;

      // const allRiverPath = d3.selectAll(".river-edge path")._groups[0];

      // allRiverPath.forEach((path) => {
      //   console.log(path);
      // });
    },
    removeOverlap() {
      const __VM = this;

      let data = [];

      // prepare an array for webcola
      const prepareColaRect = (r, i) => {
        r = d3.select(r);

        const x = Number(r.attr("x")),
          y = Number(r.attr("y")),
          w = Number(__VM.rect.size),
          h = Number(__VM.rect.size);

        const newRect = new cola.Rectangle(x, x + w, y, y + h);

        newRect.ox = x;
        newRect.oy = y;

        data[i] = newRect;
      };
      // create new layer for rect edges
      __VM.svg.append("g").attr("class", "rect-edge");
      __VM.rect.list.forEach((r, i) => {
        prepareColaRect(r, i);
      });

      // remove overlaps
      cola.removeOverlaps(data);

      const timer = 10000;
      // redraw rects using new coordinates
      const redrawD3Rect = (r, t) => {
        d3.select(r).transition().duration(timer).attr("x", t.x).attr("y", t.y);
        console.log("rd3");
      };

      // d3.select("#base-layer").attr("viewBox", [-150, -100, 1200, 700]);

      __VM.rect.list.forEach((r, i) => redrawD3Rect(r, data[i]));

      __VM.rect.list.forEach((r, i) => __VM.connectNewOldRect(data[i]));

      __VM.rectOverlapsRemoved = true;
    },
    connectNewOldRect(rect) {
      const __VM = this;

      if (rect.x !== rect.ox && rect.y !== rect.oy) {
        const line = d3.line()([
          [rect.x + __VM.rect.size / 2, rect.y + __VM.rect.size / 2],
          [rect.ox, rect.oy],
        ]);

        const checkIntersect = (line) => {
          for (const path of d3.selectAll(".river-edge path")._groups[0]) {
            const intersectPoints = findPathIntersections(
              d3.select(path).attr("d"),
              line,
              true
            );

            if (intersectPoints > 0) {
              console.log("1");
              d3.select(".rect-edge")
                .append("path")
                .attr("d", line)
                .attr("stroke", "red")
                .attr("stroke-width", "1px")
                .attr("fill", "none");

              return true;
            }
          }
        };

        checkIntersect(line);
      }

      return true;
    },
    toggleFeatureVisibility(type, name = false) {
      const __VM = this;

      __VM[type].visibility = !__VM[type].visibility;
      let layer = `.${type}-layer`;
      if (type === "river") {
        // toggle the specific river
        if (name) {
          layer = `.original-${type}-layer.${name}`;

          __VM[type].rivers[name].visibility = !__VM[type].rivers[name]
            .visibility;

          d3.select(layer).style(
            "visibility",
            __VM[type].rivers[name].visibility ? "visible" : "hidden"
          );
        }
        // toggle all rivers
        else {
          layer = `.original-${type}-layer`;

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
    setRiverWidth() {
      const __VM = this;
      d3.selectAll(".river-layer").style(
        "stroke-width",
        `${__VM.river.width}px`
      );
    },
    setRiverSpacing() {
      const __VM = this;

      d3.selectAll(".river-spacing").remove();

      // hide rivers
      __VM.river.visibility = false;
      Object.values(__VM.river.rivers).forEach((r) => (r.visibility = false));
      d3.selectAll(`.original-river-layer`).style("visibility", "hidden");

      Object.keys(__VM.river.rivers).forEach((river) => {
        const points = topojson.mesh(
          __VM.shapefile,
          __VM.shapefile.objects[river]
        ).coordinates[0];

        let spacing = Number(__VM.river.spacing);
        let spacedPoints = [];

        for (let i = 0; i < points.length; i += spacing) {
          if (points[i]) {
            spacedPoints.push(points[i]);
          }

          if (i + spacing >= points.length - 1) {
            spacedPoints.push(points[points.length - 1]);
          }
        }
        __VM.svg
          .append("path")
          .attr("class", "river-spacing")
          .attr("d", d3.line()(spacedPoints))
          .attr("stroke", "red")
          .attr("stroke-width", "4px")
          .attr("fill", "none");

        __VM.svg
          .append("g")
          .attr("class", "river-spacing")
          .selectAll("circle")
          .data(spacedPoints)
          .enter()
          .append("circle")
          .attr("fill", __VM.colorVariant[__VM.river.rivers[river].color])
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => d[1])
          .attr("r", 4);
      });
    },
  },
  data() {
    return {
      rectOverlapsRemoved: false,
      rectSizeUniformed: false,
      rectMapToColor: false,
      showBordering: { county: false, state: false },
      rect: { list: [], visibility: false, color: "success", size: 6 },
      river: {
        visibility: false,
        width: 5,
        spacing: 5,
        color: "info",
        rivers: {
          missouri: {
            visibility: false,
            color: "missouri",
            name: "Missouri",
            startingCounty: 8197,
            startingState: 4,
            countyList: [
              "8197",
              "8202",
              "5635",
              "6661",
              "6689",
              "6682",
              "6685",
              "6667",
              "6668",
              "6674",
              "6695",
              "6696",
              "6677",
              "6713",
              "6688",
              "6703",
              "6702",
              "7105",
              "7079",
              "7083",
              "7065",
              "7081",
              "7085",
              "7082",
              "7095",
              "7439",
              "7444",
              "7483",
              "7482",
              "7456",
              "7466",
              "7431",
              "7450",
              "7435",
              "6724",
              "7428",
              "7489",
              "6770",
              "6730",
              "6742",
              "6738",
              "6803",
              "6727",
              "5894",
              "6805",
              "6744",
              "5929",
              "6793",
              "6729",
              "5916",
              "5887",
              "6782",
              "6780",
              "6548",
              "6790",
              "6589",
              "6547",
              "5972",
              "6556",
              "5953",
              "6002",
              "6628",
              "6055",
              "6569",
              "6593",
              "6599",
              "6562",
              "6642",
              "6572",
              "6590",
              "6555",
              "6571",
              "6621",
              "6582",
              "6654",
              "6581",
              "6637",
              "6641",
              "5717",
            ],
          },
          mississippi: {
            visibility: false,
            color: "mississippi",
            name: "Mississippi",
            startingCounty: 6405,
            startingState: 72,
            countyList: [
              "6380",
              "6407",
              "6405",
              "6387",
              "6377",
              "6394",
              "6425",
              "6381",
              "6447",
              "6462",
              "6378",
              "6403",
              "6395",
              "8158",
              "6401",
              "6455",
              "8157",
              "8116",
              "8172",
              "8142",
              "8173",
              "8122",
              "8132",
              "5700",
              "5900",
              "5665",
              "5874",
              "5755",
              "5933",
              "5738",
              "5723",
              "5693",
              "5691",
              "5658",
              "5732",
              "6627",
              "5664",
              "6602",
              "6637",
              "6641",
              "5717",
              "5724",
              "5736",
              "5696",
              "5748",
              "5659",
              "5734",
              "6059",
              "6612",
              "6108",
              "6093",
              "6617",
              "6623",
              "7538",
              "7556",
              "7513",
              "7539",
              "5219",
              "7574",
              "7569",
              "6480",
              "6535",
              "5211",
              "5226",
              "6477",
              "6469",
              "5193",
              "5181",
              "6539",
              "6491",
              "6193",
              "6208",
              "6538",
              "6474",
              "6229",
              "6190",
              "6190",
              "6464",
              "6238",
              "6214",
              "6236",
              "6199",
              "6178",
              "6222",
              "6223",
              "6220",
              "6201",
              "6211",
              "6213",
            ],
          },
          rio_grande: {
            visibility: false,
            color: "rio_grande",
            name: "Rio Grande",
            startingCounty: 5362,
            startingState: 10,
            countyList: [
              "5503",
              "5362",
              "5333",
              "5346",
              "5359",
              "5307",
              "5317",
              "6887",
              "6879",
              "6873",
              "6881",
              "6858",
              "6890",
              "6886",
              "6885",
              "6865",
              "7656",
              "7700",
              "7774",
              "7607",
              "7807",
              "7818",
              "7747",
              "7825",
              "7838",
              "7799",
              "7693",
              "7616",
            ],
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
