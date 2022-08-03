<template>
  <a-form @submit="submit" :label-col="{span:5}" labelAlign="left">
    <a-collapse :activeKey="['mapConfig']">
      <a-collapse-panel key="mapConfig" header="配置">
        <a-form-item label="高程分级服务地址">
          <a-input v-model="config.elevationGradUrl" style="width: 400px" placeholder="到collection一级，目前只支持4326"/>
        </a-form-item>
        <a-form-item label="提示前缀">
          <a-input v-model="config.rasterQueryToolTipPrefix" style="width: 400px"/>
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