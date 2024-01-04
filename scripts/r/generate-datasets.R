# generate ICE input datasets

cat("generate-datasets: starting\n")

suppressPackageStartupMessages(library(tidyverse))
suppressPackageStartupMessages(library(bit64))

config <- config::get()

con <- DBI::dbConnect(
  RPostgres::Postgres(),
  dbname = config$db$dbname,
  host = config$db$host,
  port = config$db$port,
  user = config$db$user,
  password = config$db$password
)

# covariates --------------------------------------------------------------

cat("fetching covariates...")
# local
df_cov_local <- tbl(con, "covariates") %>%
  select(featureid, zone, riparian_distance_ft, variable, value) %>%
  filter(
    variable %in% c("AreaSqKM", "elevation", "forest", "agriculture", "jun_prcp_mm", "jul_prcp_mm", "aug_prcp_mm"),
    zone == "local",
    is.null(riparian_distance_ft)
  ) %>%
  collect() %>%
  select(-zone, -riparian_distance_ft) %>%
  spread(variable, value) %>%
  mutate(
    summer_prcp_mm = (jun_prcp_mm + jul_prcp_mm + aug_prcp_mm) / 3
  ) %>%
  select(-jun_prcp_mm, -jul_prcp_mm, -aug_prcp_mm) %>%
  rename(area_km2 = AreaSqKM) %>%
  mutate(
    forest = forest / 100,
    agriculture = agriculture / 100
  )

# upstream
df_cov_upstream <- tbl(con, "covariates") %>%
  select(featureid, zone, riparian_distance_ft, variable, value) %>%
  filter(
    variable %in% c("AreaSqKM"),
    zone == "upstream",
    is.null(riparian_distance_ft)
  ) %>%
  collect() %>%
  select(-zone, -riparian_distance_ft) %>%
  spread(variable, value) %>%
  rename(upstream_area_km2 = AreaSqKM)

# merge
df_cov <- full_join(df_cov_local, df_cov_upstream, by = "featureid")
cat("done\n")

# temp-model --------------------------------------------------------------

cat("fetching temp-model predictions...")
temp_variables <- c("mean_summer_temp", "mean_summer_temp_air2", "mean_summer_temp_air4", "mean_summer_temp_air6", "n_day_temp_gt_18", "n_day_temp_gt_22")
df_temp <- read_csv(config$`temp-model`$file, col_types = cols(.default = col_double())) %>%
  select(featureid, all_of(temp_variables)) |>
  mutate(featureid = as.integer64(featureid))
cat("done\n")

# bto-model ---------------------------------------------------------------

cat("fetching bto-model predictions...")
bto_variables <- c("occ_current", "occ_air_2", "occ_air_4", "occ_air_6", "max_air_occ30", "max_air_occ50", "max_air_occ70")
df_bto <- read_csv(config$`bto-model`$file, col_types = cols(.default = col_double())) %>%
  select(featureid, all_of(bto_variables)) |>
  mutate(featureid = as.integer64(featureid))
cat("done\n")

# state -------------------------------------------------------------------

cat("fetching states...")
df_state <- tbl(con, "catchment_state") %>%
  select(featureid, state = stusps) %>%
  collect()
cat("done\n")

# huc ---------------------------------------------------------------------

cat("fetching hucs...")
df_huc <- tbl(con, "catchment_huc12") %>%
  select(featureid, huc12) %>%
  collect() %>%
  mutate(
    huc6 = str_sub(huc12, 1, 6),
    huc8 = str_sub(huc12, 1, 8),
    huc10 = str_sub(huc12, 1, 10)
  )
cat("done\n")

# merge -------------------------------------------------------------------

cat("merging datasets...")
df <- df_huc %>%
  full_join(df_state, by = "featureid") %>%
  full_join(df_cov, by = "featureid") %>%
  full_join(df_temp, by = "featureid") %>%
  full_join(df_bto, by = "featureid") %>%
  filter(
    state %in% c("ME", "NH","VT", "MA", "RI", "CT", "NY", "NJ", "PA", "DE", "MD", "DC", "WV", "VA")
  ) %>%
  rename(id = featureid) %>%
  mutate(
    across(-c(id, starts_with("huc"), state), \(x) signif(x, digits = 4))
  )
cat("done\n")

# export ------------------------------------------------------------------

huc_columns <- tidyselect::vars_select(names(df), starts_with("huc"))

for (id in c("huc6", "huc8", "huc10")) {
  fname <- glue::glue("../../data/{id}/dataset.csv")
  cat("saving: ", fname, "\n")
  df %>%
    select(!!setdiff(names(df), setdiff(huc_columns, id))) %>%
    write_csv(fname, na = "")
}

id <- "huc12"
huc2_ids <- str_sub(df$huc12, 1, 2) %>% unique() %>% sort()

for (huc2_id in huc2_ids) {
  fname <- glue::glue("../../data/{id}-{huc2_id}/dataset.csv")
  cat("saving: ", fname, "\n")
  df %>%
    filter(str_sub(df$huc12, 1, 2) == huc2_id) %>%
    select(!!setdiff(names(df), setdiff(huc_columns, id))) %>%
    write_csv(fname, na = "")
}

cat("generate-datasets: finished\n")
