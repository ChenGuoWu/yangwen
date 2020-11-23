import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { setRemInit } from './util/rem.js';
// import 'lib-flexible/flexible'

setRemInit(); //进行初始化立即运行
import request from './api/http.js'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 引入 ECharts 主模块
let echarts = require('echarts/lib/echarts');
// 引入饼图等组件
require('echarts/lib/chart/pie')

// 引入提示框和title组件，图例
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/legendScroll')//图例滚动

//vue全局注入echarts
Vue.prototype.$echarts = echarts;
Vue.use(ElementUI);



Vue.prototype.$http = request;
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
