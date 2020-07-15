import Vue from 'vue'
import Vuex from 'vuex'

import IceStore from '@/modules/IceStore'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    ice: IceStore
  }
})
