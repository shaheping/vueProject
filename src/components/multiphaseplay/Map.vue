<template>
  <div style="height:100%;width: 100%;position: relative;overflow: hidden">
    <div id="map" ref="map" style="height:100%;width: 100%">
      <div id="mouse-position">
        <div class="custom-ol-mouse-position"></div>
      </div>
    </div>
    <div id="cacheMap" style="height:1px;width: 1px"></div>
    <a-button @click="resetMapSize" id="settings" icon="setting">设置</a-button>
    <!--    <a-button @click="start('image')" id="image" title="请求视图范围内整张">当前视图范围</a-button>-->
    <!--    <a-button @click="start('tile')" id="tile" title="切片大小256">切片（256）</a-button>-->
    <a-button @click="executePublishProcess" id="publish">发布影像服务
    </a-button>
    <a-button @click="start('staticImage')" id="staticImage" title="请求item全幅，设置中指定图片像素的宽高
  缩放平移不再发新请求，缺点大比例尺分辨率会降低">开始
    </a-button>
    <a-button @click="end" id="end">停止</a-button>

    <a-drawer ref="SearchTable" :width="650"
              placement="right" :visible="settingsVisible"
              :body-style="{'margin-top':'30px'}"
              :mask-closable="false" :get-container="false"
              :mask="false"
              @close="resetMapSize">
      <Settings></Settings>
    </a-drawer>

    <div v-show="loading" style="position: absolute;top: 45%;left:47%;text-align: center" ref="spin">
      <a-spin tip="loading.." size="large"/>
    </div>
  </div>
</template>

<script>
import 'ol/ol.css'
import {Map as OLMap} from 'ol';
import * as control from 'ol/control'
import {Logo} from '@supermap/iclient-ol';
import {getMapConfig} from "@/util/mapConfig";
import {format} from 'ol/coordinate'
import Settings from "@/components/multiphaseplay/Settings";
import axios from "axios";
import {get} from "ol/proj";
import {ImageWMS, TileWMS} from "ol/source";
import {config} from "@/global";
import {Image as ImageLayer, Tile} from "ol/layer";
import Static from "ol/source/ImageStatic";
// import {debounce} from "ant-design-vue/lib/vc-table/src/utils";

export default {
  name: "Map",
  components: {Settings},
  data() {
    let resolutions_m = [];
    let worldWidth_m = 20037508.342789244 * 2;
    for (let i = 0; i < 20; i++) {
      resolutions_m.push(worldWidth_m / (256 * Math.pow(2, i)));
    }
    let resolutions_degree = [];
    let worldWidth_unit = 360;
    for (let i = 0; i < 20; i++) {
      resolutions_degree.push(worldWidth_unit / (256 * Math.pow(2, i)));
    }
    return {
      map: null,
      cacheMap: null,
      settingsVisible: false,
      allFeatures: [],
      timer: null,
      index: 0,
      layer: null,
      resolutions: {
        METER: resolutions_m,
        DEGREE: resolutions_degree
      },
      proj: null,
      wmsSources: [],
      wmsSourcesCache: [],
      loadedAllWMSImage: false,
      loading: false,
      cacheSourceLayerMap: new Map()
    }
  },
  watch: {},
  computed: {},
  methods: {
    //地图初始化
    init() {
      let mapConfig = getMapConfig();
      this.map = new OLMap({
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
        layers: mapConfig.layers,
        view: mapConfig.view
      });
      this.cacheMap = new OLMap({
        target: 'cacheMap',
        view: mapConfig.view
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

    start(type, startTimer = true) {
      if (this.layer) {
        startTimer && this.initStaticTimer();
        return;
      }
      const url = config.imageService + "/search.json?collections=" + config.collection;
      axios.get(config.imageService + "/collections/" + config.collection + "/tileInfo.json").then(res => {
        this.proj = get(res.data.crs);
      });
      axios.get(url).then(res => {
        this.allFeatures.length === 0 && res.data.features.forEach(feature => {
          this.allFeatures.push({
            collection: feature.collection,
            name: feature.assets.data.title,
            time: feature.properties.createtime,
            bbox: feature.bbox
          });
        });
        switch (type) {
          case "image":
            this.addImageLayer();
            this.initTimer();
            break;
          case "tile":
            this.addTileLayer();
            this.initTimer();
            break;
          case "staticImage":
            this.addStaticImageLayer();
            startTimer && this.initStaticTimer();
            break;
          case "cache":
            this.allFeatures.forEach(feature => {
              let imageExtent = feature.bbox;
              let wmsurl = this.formatWMSURL(feature.time, imageExtent);
              let source = this.buildStaticSource(wmsurl, imageExtent);
              let layer = new ImageLayer({source});
              this.cacheSourceLayerMap.set(source, layer);
              source.on("imageloadend", () => {
                this.cacheMap.removeLayer(this.cacheSourceLayerMap.get(source));
              });

              this.cacheMap.addLayer(layer);
              this.wmsSourcesCache.push(source);
            });
            // [...this.cacheMap.getLayers().getArray()].forEach(layer => this.cacheMap.removeLayer(layer));
            break;
        }
      });
    },

    addImageLayer() {
      this.layer = new ImageLayer({
        source: new ImageWMS({
          url: config.imageWMSService,
          params: {
            LAYERS: "0.0.3",
            SQLFILTER: "createtime= '" + this.allFeatures[this.index].time.replaceAll("/", "-") + "'",
          },
        }),
        opacity: 0.7,
      });
      this.map.addLayer(this.layer);
    },

    addTileLayer() {
      // let epsg = get(config.mapConfig.projection);
      // let extent = epsg.getExtent();
      // console.log(extent, epsg.getUnits(), config.tileSize);
      // let resolutions = epsg.getUnits() === 'm' ? this.resolutions.METER : this.resolutions.DEGREE;
      // const tileGrid = new TileGrid({
      //   extent: extent,
      //   resolutions: resolutions,
      //   tileSize: config.tileSize.split(","),
      // });
      this.layer = new Tile({
        source: new TileWMS({
          url: config.imageWMSService,
          params: {
            LAYERS: "0.0.3",
            SQLFILTER: "createtime= '" + this.allFeatures[this.index].time.replaceAll("/", "-") + "'"
          },
          // tileGrid: tileGrid
        }),
        opacity: 0.7,
      });
      this.map.addLayer(this.layer);
    },

    buildStaticSource(url, imageExtent) {
      return new Static({
        url: url,
        imageExtent: imageExtent,
        projection: this.proj
      });
    },

    formatWMSURL(time, extent) {
      const commentSetting = config.imageWMSService + '?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=0.0.3';
      let SQLFilter = "SQLFILTER=createtime='" + time.replaceAll("/", "-") + "'";
      let crs = "CRS=" + this.proj.getCode();
      let width = "WIDTH=" + config.tileSize.split(",")[0];
      let height = "HEIGHT=" + config.tileSize.split(",")[1];
      let bbox = [extent[1], extent[0], extent[3], extent[2]];
      let bboxStr = "BBOX=" + bbox.join(",");
      return commentSetting + "&" + SQLFilter + "&" + crs + "&" + width + "&" + height + "&" + bboxStr;
    },

    addStaticImageLayer() {
      let feature = this.allFeatures[this.index];
      let imageExtent = feature.bbox;
      let url = this.formatWMSURL(feature.time, imageExtent);
      this.layer = new ImageLayer({
        source: this.buildStaticSource(url, imageExtent),
        opacity: 0.7
      });
      this.map.addLayer(this.layer);
    },

    end() {
      clearInterval(this.timer);
      this.timer = null;
      this.map.removeLayer(this.layer);
      this.layer = null;
      this.index = 0;
      this.allFeatures = [];
    },

    initTimer() {
      this.timer = setInterval(() => {
        this.index = this.index === this.allFeatures.length - 1 ? 0 : ++this.index;
        this.layer.getSource().updateParams({
          LAYERS: "0.0.3",
          SQLFILTER: "createtime= '" + this.allFeatures[this.index].time.replaceAll("/", "-") + "'"
        });
      }, 200);
    },

    initStaticTimer() {
      this.timer = setInterval(() => {
        this.index = this.index === this.allFeatures.length - 1 ? 0 : this.index + 1;
        let source = this.loadedAllWMSImage && this.map.tileQueue_.getTilesLoading() === 0 ? this.wmsSources[this.index] : this.wmsSourcesCache[this.index];
        // let source = this.wmsSourcesCache[this.index];
        this.layer.setSource(source);
      }, 200);
    },

    getSmallerExtent(extent1, extent2) {
      return [
        Math.floor(Math.max(extent1[0], extent2[0])),
        Math.floor(Math.max(extent1[1], extent2[1])),
        Math.ceil(Math.min(extent1[2], extent2[2])),
        Math.ceil(Math.min(extent1[3], extent2[3]))
      ];
    },

    debounce(fn, wait) {
      let timer = null;
      let that = this;
      return function () {
        that.loadedAllWMSImage = false;
        that.wmsSources = [];
        [...that.cacheMap.getLayers().getArray()].forEach(layer => that.cacheMap.removeLayer(layer));
        if (timer !== null) {
          console.log('clear');
          clearTimeout(timer);
        }
        timer = setTimeout(fn, wait);
      };
    },

    blindMoveEndEvent() {
      this.map.on('moveend', this.debounce(() => {
        if (!this.layer || !this.timer) {
          return;
        }
        let size = this.allFeatures.length;
        let index = 0;
        this.allFeatures.forEach(feature => {
          let imageExtent = this.getSmallerExtent(feature.bbox, this.map.getView().calculateExtent(this.map.getSize()));
          let wmsurl = this.formatWMSURL(feature.time, imageExtent);
          let source = this.buildStaticSource(wmsurl, imageExtent);
          this.wmsSources.push(source);
          let layer = new ImageLayer({source});
          this.cacheSourceLayerMap.set(source, layer);
          source.on("imageloadend", () => {
            if (++index === size) {
              this.loadedAllWMSImage = true;
            }
            this.cacheMap.removeLayer(this.cacheSourceLayerMap.get(source));
          });
          this.cacheMap.addLayer(layer);
        });
      }, 1000));
    },

    executePublishProcess() {
      let setting = config.imageServicePublishSetting;
      let params = JSON.parse(JSON.stringify(setting.params));
      params.interfaceTypes = params.interfaceTypes ? params.interfaceTypes.split(",") : "";
      let sendParams = {token: setting.token, parameter: JSON.stringify(params)};
      this.loading = true;
      axios.get(setting.url + "execute", {params: sendParams}).then((result) => {
        console.log(result.data);
        this.loading = false;
        this.start("staticImage", false);
      });
    }
  },
  mounted() {
    this.init();
    this.start("cache", false);
    this.blindMoveEndEvent();
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

#publish {
  position: absolute;
  margin: 10px;
  right: 300px;
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