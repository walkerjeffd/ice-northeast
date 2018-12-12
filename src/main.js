import Vue from 'vue'
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.vue'
import { store } from './store'
import config from './config'

Vue.config.productionTip = false

axios.defaults.baseURL = config[process.env.NODE_ENV].api.url

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
