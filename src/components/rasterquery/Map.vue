<template>
  <div style="height:100%;width: 100%;position: relative;overflow: hidden">
    <div id="map" ref="map" style="height:100%;width: 100%">
      <div id="mouse-position">
        <div class="custom-ol-mouse-position"></div>
      </div>
    </div>
    <a-button @click="resetMapSize" id="settings" icon="setting">设置</a-button>
    <a-drawer ref="SearchTable" :width="650"
              placement="right" :visible="settingsVisible"
              :body-style="{'margin-top':'30px'}"
              :mask-closable="false" :get-container="false"
              :mask="false"
              @close="resetMapSize">
      <Settings></Settings>
    </a-drawer>
    <div style="background: aliceblue;font-size: large;padding:5px;" id="popup"></div>
  </div>
</template>

<script>
import 'ol/ol.css'
import {Feature, Map, Overlay, View} from 'ol';
import * as control from 'ol/control'
import {Logo} from '@supermap/iclient-ol';
import {format} from 'ol/coordinate'
import Settings from "@/components/rasterquery/Settings";
import Tile from "ol/layer/Tile";
import {XYZ} from "ol/source";
import {config} from "@/global";
import axios from "axios";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Point} from "ol/geom";

export default {
  name: "Map",
  components: {Settings},
  data() {
    return {
      map: null,
      settingsVisible: false
    }
  },
  watch: {},
  computed: {},
  methods: {
    //地图初始化
    init() {
      let urlTemplate = config.rasterQueryUrl + "/tile.webp?z={z}&x={x}&y={y}";

      this.map = new Map({
        target: 'map',
        controls: control.defaults().extend([
          new Logo(),
          new control.ScaleLine(),
          new control.MousePosition({
            coordinateFormat: (coordinate) => {
              return format(coordinate, '经度:{x} 纬度:{y}', 2);
            },
            projection: "EPSG:4326",
            className: 'custom-ol-mouse-position',
            target: document.getElementById("mouse-position")
          })
        ]),
        layers: [
          new Tile({
            source: new XYZ({
              url: urlTemplate,
              projection: "EPSG:4326"
            })
          })
        ],
        view: new View({
          projection: "EPSG:4326",
          minZoom: 1,
          center: [110, 19],
          zoom: 9
        })
      });

      let helpTooltipElement = document.getElementById('popup');
      let helpTooltip = new Overlay({
        element: helpTooltipElement,
        positioning: 'center-left',
        offset: [10, 0]
      });
      this.map.addOverlay(helpTooltip);

      let source = new VectorSource({});
      let vector = new VectorLayer({source})
      this.map.addLayer(vector);
      this.map.on('singleclick', e => {
        let position = [e.coordinate[0], e.coordinate[1]];
        axios.get(config.rasterQueryUrl + "/rasterValue.json?x=" + position[0] + "&y=" + position[1]).then(result => {
          helpTooltip.setPosition(position);
          helpTooltipElement.innerHTML = config.rasterQueryToolTipPrefix + ":" + result.data.rasterValueInfo.bandValues;
          let feature = new Feature({
            geometry: new Point(position),
            name: "userset"
          });
          source.clear();
          source.addFeature(feature);
        });
      });
    },

    resetMapSize() {
      this.settingsVisible = !this.settingsVisible
      let size = this.map.getSize();
      let newSize = size;
      let searchTableWidth = this.$refs.SearchTable.width;
      if (this.settingsVisible) {
        newSize[0] = size[0] - searchTableWidth;
      } else {
        newSize[0] = size[0] + searchTableWidth;
      }
      this.$refs.map.style.width = newSize[0] + "px";
      this.map.updateSize();
      let view = this.map.getView();
      view.fit(view.calculateExtent(this.map.getSize()));
      this.map.render();
    },
  },
  mounted() {
    this.init();
  }
};
</script>

<style>
#mouse-position {
  height: 23px;
  opacity: 0.7;
  background: white;
  color: black;
  position: absolute;
  padding: 2px;
  bottom: 10px;
  left: 110px;
  z-index: 2000;
}

#settings {
  position: absolute;
  margin: 10px;
  right: 30px;
  z-index: 2000;
  top: 0;
}

#image {
  position: absolute;
  margin: 10px;
  right: 460px;
  z-index: 2000;
  top: 0;
}

#tile {
  position: absolute;
  margin: 10px;
  right: 345px;
  z-index: 2000;
  top: 0;
}

#staticImage {
  position: absolute;
  margin: 10px;
  right: 225px;
  z-index: 2000;
  top: 0;
}

#end {
  position: absolute;
  margin: 10px;
  right: 150px;
  z-index: 2000;
  top: 0;
}

</style>