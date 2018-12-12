import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import * as crossfilter from 'crossfilter2'

Vue.use(Vuex)

const xf = crossfilter()

let dim
let group

export function getGroupByKey (key) {
  return group.all().find(d => d.key === key)
}

export const store = new Vuex.Store({
  state: {
    config: null,
    theme: null,
    variable: null
  },
  getters: {
    config: state => state.config,
    themes: state => (state.config ? state.config.themes : []),
    theme: state => state.theme,
    variables: state => (state.theme ? state.theme.variables : []),
    variable: state => state.variable,
    layer: state => (state.theme ? state.theme.layer : undefined)
  },
  mutations: {
    SET_CONFIG (state, config) {
      state.config = config
    },
    SET_THEME (state, theme) {
      state.theme = theme
    },
    SET_VARIABLE (state, variable) {
      state.variable = variable
    }
  },
  actions: {
    loadConfig ({ commit }, config) {
      commit('SET_CONFIG', config)
      return Promise.resolve(config)
    },
    selectThemeById ({ commit, getters, dispatch }, id) {
      if (!getters.themes || getters.themes.length === 0 || !id) return

      const theme = getters.themes.find(d => d.id === id)

      if (!theme) return

      return axios.get(`${theme.dataset.url}`)
        .then(response => response.data)
        .then((csv) => {
          const data = d3.csv.parse(csv, (d) => {
            getters.variables.forEach((v) => {
              d[v.id] = d[v.id] === 'NA' ? null : +d[v.id]
            })
            return d
          })

          if (group) group.dispose()
          if (dim) dim.dispose()

          xf.remove()
          xf.add(data)

          dim = xf.dimension(d => d[theme.group.by])

          commit('SET_THEME', theme)

          return theme
        })
    },
    selectVariableById ({ commit, getters, dispatch }, id) {
      if (!getters.variables || getters.variables.length === 0) return

      const variable = getters.variables.find(d => d.id === id)

      if (!variable) return

      commit('SET_VARIABLE', variable)

      if (group) group.dispose()
      group = dim.group().reduceSum(d => d[variable.id])

      return Promise.resolve(variable)
    }
  }
})
