export const ENVIROMENT = {
  // Project
  HOST: import.meta.env.HOST,

  // Authentication
  AIRTABLE_ACCESS_TOKEN: import.meta.env.PROD ? import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN : import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN,
  AIRTABLE_HOST: import.meta.env.VITE_AIRTABLE_HOST,
  // Purchases
  USA_PURCHASES_BASE: import.meta.env.VITE_USA_PURCHASES_BASE,
  USA_PURCHASES_TABLE: import.meta.env.VITE_USA_PURCHASES_TABLE,
  // Sales
  USA_SALES_BASE: import.meta.env.VITE_USA_SALES_BASE,
  USA_COST_ANALYSIS_TABLE: import.meta.env.VITE_USA_COST_ANALYSIS_TABLE,
  USA_CA_PHASES_TABLE: import.meta.env.VITE_USA_CA_PHASES_TABLE,
  USA_CA_LABOR_DETAILS_TABLE: import.meta.env.VITE_USA_CA_LABOR_DETAILS_TABLE,
  // Operations
  USA_OPERATIONS_BASE: import.meta.env.VITE_USA_OPERATIONS_BASE,
  USA_TRAVEL_TIMES_TABLE: import.meta.env.VITE_USA_TRAVEL_TIMES_TABLE,
  USA_WORKED_TIMES_TABLE: import.meta.env.VITE_USA_WORKED_TIMES_TABLE,
  USA_WAITING_TIMES_TABLE: import.meta.env.VITE_USA_WAITING_TIMES_TABLE,
  USA_PROJECTS_TABLE: import.meta.env.VITE_USA_PROJECTS_TABLE,

  // Microsoft Login
  MS_CLIENT_ID: import.meta.env.PROD ? import.meta.env.MS_CLIENT_ID : import.meta.env.VITE_MS_CLIENT_ID,
  MS_REDIRECT_URI: import.meta.env.VITE_MS_REDIRECT_URI,
  MS_TENANT_ID: import.meta.env.PROD ? import.meta.env.MS_TENANT_ID : import.meta.env.VITE_MS_TENANT_ID,
}