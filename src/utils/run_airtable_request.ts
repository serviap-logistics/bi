import { airtable_request_options } from '../settings/airtableRequestSettings';

export type airtable_request = {
  view: string;
  fields: string[] | undefined;
  formula?: string;
  offset?: string | undefined;
};

export const generateEncode = (props: airtable_request) => {
  let encode =
    '?' +
    (props?.view != undefined ? `view=${props.view}&` : '') +
    (props?.formula ? `filterByFormula=${props.formula}&` : '');
  if (props?.fields != undefined) {
    const encoded_fields: string[] = [];
    props.fields.map((field) => encoded_fields.push(`fields=${field}`));
    encode += encoded_fields.join('&');
  }
  encode += props.offset != undefined ? `&offset=${props.offset}` : '';
  return encode;
};

export default async function airtableRequest(
  endpoint: string,
  settings: airtable_request,
) {
  const records_found: any[] = [];
  try {
    do {
      const page = await fetch(
        `${endpoint}${generateEncode(settings)}`,
        airtable_request_options,
      ).then((res) => res.json());
      if (page?.records) {
        const records: any[] = page.records.map(
          ({ id, createdTime, fields }) => ({
            id,
            createdTime,
            ...fields,
          }),
        );
        records_found.push(...records);
        settings.offset = page?.offset;
      }
    } while (settings.offset != undefined);
    return records_found;
  } catch (error) {
    console.error(error);
    return [];
  }
}
