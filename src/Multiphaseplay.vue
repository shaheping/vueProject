<template>
  <a-config-provider :locale="zh_CN">
    <div id="app">
      <a-layout style="height: 100vh">
        <a-layout-header>
          <Head/>
        </a-layout-header>
        <a-layout-content>
          <Map/>
        </a-layout-content>
      </a-layout>
    </div>
  </a-config-provider>
</template>

<script>
import Map from './components/multiphaseplay/Map'
import Head from './components/multiphaseplay/Head'
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn'
import {config} from "@/global";

moment.locale('zh-cn');
export default {
  name: 'Multiphaseplay',
  components: {
    Map,
    Head
  },
  data() {
    return {
      zh_CN
    }
  },
  created() {
    let urlSearchParams = new URLSearchParams(window.location.search);
    config.root = urlSearchParams.get("root");
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
