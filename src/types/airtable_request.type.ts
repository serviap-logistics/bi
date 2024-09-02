export type airtable_request_type = {
  view?: string,
  fields?: string[],
  formula?: string,
  offset: string | undefined
}