import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import * as crossfilter from 'crossfilter2'

Vue.use(Vuex)

const xf = crossfilter()

// xf.onChange(() => {
//   store.dispatch('setFilteredCount', xf.allFiltered().length)
// })
window.xf = xf

const agg = {
  dim: undefined,
  group: undefined,
  map: {}
}

const dims = {}

export function getGroupByKey (key) {
  return agg.map[key]
}

export function addDim (key) {
  dims[key] = xf.dimension(d => d[key])
  return dims[key]
}

export function removeDim (key) {
  dims[key].dispose()
}

export function getDim (key) {
  return dims[key]
}

export function getData () {
  return xf.all()
}

export function getFilteredCount () {
  return xf.allFiltered().length
}

export const store = new Vuex.Store({
  state: {
    config: null,
    theme: null,
    variable: null,
    counts: {
      filtered: 0,
      total: 0
    }
  },
  getters: {
    config: state => state.config,
    themes: state => (state.config ? state.config.themes : []),
    theme: state => state.theme,
    variables: state => (state.theme ? state.theme.variables : []),
    variable: state => state.variable,
    layer: state => (state.theme ? state.theme.layer : undefined),
    counts: state => state.counts,
    filteredCount: state => state.counts.filtered,
    totalCount: state => state.counts.total
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
    },
    SET_FILTERED_COUNT (state, count) {
      state.counts.filtered = count
    },
    SET_TOTAL_COUNT (state, count) {
      state.counts.total = count
    }
  },
  actions: {
    loadConfig ({ commit }, config) {
      commit('SET_CONFIG', config)
      return Promise.resolve(config)
    },
    setFilteredCount ({ commit }, count) {
      commit('SET_FILTERED_COUNT', count)
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

          if (theme.group) {
            if (agg.group) agg.group.dispose()
            if (agg.dim) agg.dim.dispose()
          }

          xf.remove()
          xf.add(data)

          if (theme.group) {
            agg.dim = xf.dimension(d => d[theme.group.by])
          }

          commit('SET_TOTAL_COUNT', xf.size())
          commit('SET_FILTERED_COUNT', xf.allFiltered().length)
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

      if (typeof theme.group.weight === 'string') {
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
      } else if (typeof theme.group.weight === 'number') {
        agg.group = agg.dim.group().reduce(
          (p, v) => {
            p.count += 1
            p.sum += v[variable.id] * theme.group.weight
            p.wsum += theme.group.weight
            p.mean = p.count >= 1 ? p.sum / p.wsum : null
            return p
          },
          (p, v) => {
            p.count -= 1
            p.sum -= v[variable.id] * theme.group.weight
            p.wsum -= theme.group.weight
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
      }

      agg.group.all().forEach(d => {
        agg.map[d.key] = d.value // d is a reference, automatically updates after filtering
      })

      variable.extent = d3.extent(xf.all().map(d => d[variable.id]))

      commit('SET_VARIABLE', variable)

      return Promise.resolve(variable)
    }
  }
})
