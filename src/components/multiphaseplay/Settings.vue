<template>
  <a-form @submit="submit" :label-col="{span:5}" labelAlign="left">
    <a-collapse :activeKey="['mapConfig','imageServicePublishSetting','imageServicePublishParamSetting']">
      <a-collapse-panel key="mapConfig" header="配置">
        <a-form-item label="地图服务地址">
          <a-input v-model="config.mapService.url" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="地图名称">
          <a-input v-model="config.mapService.map"/>
        </a-form-item>
        <a-form-item label="中心点">
          <a-input v-model="config.mapConfig.center"/>
        </a-form-item>
        <a-form-item label="默认层级">
          <a-input v-model="config.mapConfig.zoom"/>
        </a-form-item>
        <a-form-item label="影像服务地址">
          <a-input v-model="config.imageService" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="影像WMS服务地址">
          <a-input v-model="config.imageWMSService" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="影像集合">
          <a-input v-model="config.collection"/>
        </a-form-item>
        <a-form-item label="指定像素的宽高">
          <a-input v-model="config.tileSize"/>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="imageServicePublishSetting" header="发布影像服务工具配置">
        <a-form-item label="发布影像服务工具地址">
          <a-input v-model="config.imageServicePublishSetting.url" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="token">
          <a-input v-model="config.imageServicePublishSetting.token" style="width: 400px"
                   placeholder="发布影像工具所在iServer token"/>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="imageServicePublishParamSetting" header="发布影像服务工具参数配置">
        <a-form-item label="iserverPath">
          <a-input v-model="config.imageServicePublishSetting.params.iserverPath" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="token">
          <a-input v-model="config.imageServicePublishSetting.params.token" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="serviceName">
          <a-input v-model="config.imageServicePublishSetting.params.serviceName" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="dsConnInfo">
          <a-input v-model="config.imageServicePublishSetting.params.dsConnInfo" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="collectionId">
          <a-input v-model="config.imageServicePublishSetting.params.collectionId" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="crs">
          <a-input v-model="config.imageServicePublishSetting.params.crs" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="listFilePath">
          <a-input v-model="config.imageServicePublishSetting.params.listFilePath" style="width: 400px"/>
        </a-form-item>
        <a-form-item label="interfaceTypes">
          <a-input v-model="config.imageServicePublishSetting.params.interfaceTypes" style="width: 400px"/>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
    <a-form-item style="text-align: center">
      <a-space>
        <a-button type="primary" icon="save" @click="submit" title="只能保存到当前浏览器">保存</a-button>
        <a-button type="primary" icon="undo" @click="setDefault">恢复默认</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script>
import {config} from "@/global";

export default {
  name: "Settings",
  data() {
    return {
      config: config
    }
  },
  methods: {
    submit() {
      console.log(config)
      let data = JSON.stringify(config, null, 2);
      window.localStorage.setItem("SuperMap-MultiPhasePlay-Config", data);
      location.reload();
    },
    setDefault() {
      window.localStorage.removeItem("SuperMap-MultiPhasePlay-Config");
      location.reload();
    }
  }
}
</script>

<style scoped>
input {
  width: 150px;
}

.ant-form-item {
  margin-bottom: 0;
}

</style>