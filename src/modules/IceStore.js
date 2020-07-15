import axios from 'axios'
import * as d3 from 'd3'

import { xf, agg } from '@/libs/IceCrossfilter'

export default {
  state: {
    config: null,
    theme: null,
    variable: null,
    stats: {
      count: 0
    }
  },
  getters: {
    config: state => state.config,
    themes: state => (state.config ? state.config.themes : []),
    theme: state => state.theme,
    variables: state => (state.theme ? state.theme.variables : []),
    variable: state => state.variable,
    layer: state => (state.theme ? state.theme.layer : undefined),
    stats: state => state.stats
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
    SET_STATS_COUNT (state, count) {
      state.stats.count = count
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
          const data = d3.csvParse(csv, (d, i) => {
            theme.variables.forEach((v) => {
              d[v.id] = d[v.id] === theme.dataset.na_value ? null : +d[v.id]
            })
            d.$index = i
            return d
          })

          if (theme.group) {
            if (agg.group) agg.group.dispose()
            if (agg.dim) agg.dim.dispose()
          }

          xf.all.remove()
          xf.all.add(data)

          if (theme.group) {
            agg.dim = xf.all.dimension(d => d[theme.group.by])
          }

          commit('SET_STATS_COUNT', data.length)
          commit('SET_THEME', theme)

          return theme
        })
    },
    selectVariableFilterPercent ({ commit, getters, dispatch }, variable) {
      const theme = getters.theme

      agg.map = {}

      if (agg.group) agg.group.dispose()

      const data = xf.all.all()
      const total = d3.nest()
        .key(d => d[theme.group.by])
        .rollup(v => d3.sum(v, d => d[theme.group.weight]))
        .object(data)

      if (typeof theme.group.weight === 'string') {
        agg.group = agg.dim.group().reduce(
          (p, v) => {
            p.count += 1
            p.sum += v[theme.group.weight]
            p.mean = p.sum / total[v[theme.group.by]]
            return p
          },
          (p, v) => {
            p.count -= 1
            p.sum -= v[theme.group.weight]
            p.mean = p.sum / total[v[theme.group.by]]
            return p
          },
          () => {
            return {
              count: 0,
              sum: 0,
              mean: null
            }
          }
        )
      } else if (typeof theme.group.weight === 'number') {
        agg.group = agg.dim.group().reduce(
          (p, v) => {
            p.count += 1
            p.sum += theme.group.weight
            p.mean = p.sum / total[v[theme.group.by]]
            return p
          },
          (p, v) => {
            p.count -= 1
            p.sum -= theme.group.weight
            p.mean = p.sum / total[v[theme.group.by]]
            return p
          },
          () => {
            return {
              count: 0,
              sum: 0,
              mean: null
            }
          }
        )
      }

      agg.group.all().forEach(d => {
        agg.map[d.key] = d.value // d is a reference, automatically updates after filtering
      })

      variable.extent = [0, 1]

      commit('SET_VARIABLE', variable)

      return Promise.resolve(variable)
    },
    selectVariableById ({ commit, getters, dispatch }, id) {
      if (!getters.variables || getters.variables.length === 0) return

      const variable = getters.variables.find(d => d.id === id)

      if (!variable) {
        console.error(`selectVariableById(${id}): variable not found`)
        return
      }

      const theme = getters.theme

      agg.map = {}

      if (agg.group) agg.group.dispose()

      if (typeof theme.group.weight === 'string') {
        agg.group = agg.dim.group().reduce(
          (p, v) => {
            if (v[variable.id] === null) return p
            p.count += 1
            p.sum += v[variable.id] * v[theme.group.weight]
            p.wsum += v[theme.group.weight]
            p.mean = p.count >= 1 ? p.sum / p.wsum : null
            return p
          },
          (p, v) => {
            if (v[variable.id] === null) return p
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
            if (v[variable.id] === null) return p
            p.count += 1
            p.sum += v[variable.id] * theme.group.weight
            p.wsum += theme.group.weight
            p.mean = p.count >= 1 ? p.sum / p.wsum : null
            return p
          },
          (p, v) => {
            if (v[variable.id] === null) return p
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

      variable.extent = d3.extent(xf.all.all().map(d => d[variable.id]))

      commit('SET_VARIABLE', variable)

      return Promise.resolve(variable)
    }
  }
}
