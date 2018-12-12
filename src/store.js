import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import * as crossfilter from 'crossfilter2'

Vue.use(Vuex)

const xf = crossfilter()
window.xf = xf

let agg = {
  dim: undefined,
  group: undefined,
  map: {}
}
// const weightSum = new Map()

export function getGroupByKey (key) {
  return agg.map[key]
}

window.agg = agg

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
          const data = d3.csvParse(csv, (d) => {
            theme.variables.forEach((v) => {
              d[v.id] = d[v.id] === theme.dataset.na_value ? null : +d[v.id]
            })
            return d
          })

          if (agg.group) agg.group.dispose()
          if (agg.dim) agg.dim.dispose()

          xf.remove()
          xf.add(data)

          agg.dim = xf.dimension(d => d[theme.group.by])

          // const weightGroup = agg.dim.group().reduce(
          //   (p, v) => {
          //     p.count += 1
          //     p.weight += v[theme.group.weight]
          //     return p
          //   },
          //   (p, v) => {
          //     p.count -= 1
          //     p.weight -= v[theme.group.weight]
          //     return p
          //   },
          //   () => {
          //     return {
          //       count: 0,
          //       weight: 0
          //     }
          //   }
          // )

          // weightSum.clear()
          // weightGroup.all().forEach(d => {
          //   weightSum.set(d.key, d.value)
          // })

          // weightGroup.dispose()

          commit('SET_THEME', theme)

          return theme
        })
    },
    selectVariableById ({ commit, getters, dispatch }, id) {
      if (!getters.variables || getters.variables.length === 0) return

      const variable = getters.variables.find(d => d.id === id)

      if (!variable) return

      const theme = getters.theme

      agg.map = {}

      if (agg.group) agg.group.dispose()
      agg.group = agg.dim.group().reduce(
        (p, v) => {
          p.count += 1
          p.sum += v[variable.id] * v[theme.group.weight]
          p.wsum += v[theme.group.weight]
          p.mean = p.count >= 1 ? p.sum / p.wsum : null
          return p
        },
        (p, v) => {
          p.count -= 1
          p.sum -= v[variable.id] * v[theme.group.weight]
          p.wsum -= v[theme.group.weight]
          p.mean = p.count >= 1 ? p.sum / p.wsum : null
          return p
        },
        () => {
          return {
            count: 0,
            sum: 0,
            wsum: 0,
            mean: null
          }
        }
      )

      agg.group.all().forEach(d => {
        agg.map[d.key] = d.value // d is a reference, automatically updates after filtering
      })

      commit('SET_VARIABLE', variable)

      return Promise.resolve(variable)
    }
  }
})