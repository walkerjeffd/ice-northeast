import Vue from 'vue'
import Vuex from 'vuex'

import { IceStore } from 'ice-components'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    ice: IceStore
  }
})
