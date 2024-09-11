export type airtable_request_type = {
  view: string;
  fields: string[] | undefined;
  formula?: string;
  offset?: string | undefined;
};
