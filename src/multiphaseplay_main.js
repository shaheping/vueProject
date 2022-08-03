import Vue from 'vue'
import Multiphaseplay from './Multiphaseplay.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import * as global from "@/global";

Vue.config.productionTip = false
Vue.use(Antd)

//先初始化，获取全局设置
global.init().then(() => {
    new Vue({
        render: h => h(Multiphaseplay),
    }).$mount('#app')
});
