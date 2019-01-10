# generate ICE config file

library(tidyverse)
library(jsonlite)

config <- config::get()


# variables ---------------------------------------------------------------

df_variables <- read_csv("../variables.csv", col_types = cols(
  default = col_logical(),
  id = col_character(),
  label = col_character(),
  map = col_logical(),
  filter = col_logical(),
  formats_axis = col_character(),
  formats_value = col_character(),
  scale_domain_min = col_double(),
  scale_domain_max = col_double(),
  scale_transform = col_character()
))

variables <- transpose(df_variables) %>%
  lapply(function (x) {
    list(
      default = x$default,
      id = x$id,
      label = x$label,
      map = x$map,
      filter = x$filter,
      formats = list(
        axis = x$formats_axis,
        value = x$formats_value
      ),
      scale = list(
        domain = c(x$scale_domain_min, x$scale_domain_max),
        transform = x$scale_transform
      )
    )
  })


# themes ------------------------------------------------------------------

df_themes <- read_csv("../themes.csv", col_types = cols(
  .default = col_character(),
  default = col_logical()
))

themes <- transpose(df_themes) %>%
  lapply(function (x) {
    list(
      default = x$default,
      id = x$id,
      label = x$label,
      dataset = list(
        url = x$dataset_url,
        na_value = ''
      ),
      layer = list(
        url = x$layer_url,
        geometry = x$layer_geometry,
        type = x$layer_type,
        object = x$layer_object
      ),
      group = list(
        by = x$group_by,
        weight = x$group_weight
      ),
      variables = variables
    )
  })


# export ------------------------------------------------------------------

list(themes = themes)%>%
  write_json(path = "../../data/ice-sheds.json", auto_unbox = TRUE, pretty = TRUE, na = "null")
