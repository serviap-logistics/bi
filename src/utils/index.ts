export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export type request_settings_type = { view?: string, fields?: string[], formula?: string, offset: string | undefined}

export const generateEncode = (props: request_settings_type) => {
  let encode = '?' + (props?.view != undefined ? `view=${props.view}&`: '') + (props?.formula ? `filterByFormula=${props.formula}&`: '')
  if (props?.fields != undefined) {
    let encoded_fields: string[] = []
    props.fields.map((field) => encoded_fields.push(`fields=${field}`))
    encode += encoded_fields.join('&')
  }
    encode += props.offset != undefined ? `&offset=${props.offset}` : ''
  return encode
}
