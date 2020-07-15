import crossfilter from 'crossfilter2'

export const xf = {
  all: crossfilter(),
  subset: crossfilter()
}

export const agg = {
  dim: undefined,
  group: undefined,
  map: {}
}

export function getGroupByKey (key) {
  return agg.map[key]
}

export function isFiltered (index) {
  return xf.all.isElementFiltered(index)
}

export function getFilteredCount () {
  return xf.all.allFiltered().length
}
