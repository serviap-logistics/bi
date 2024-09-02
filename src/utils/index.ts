import { airtable_request_type } from "../types/airtable_request.type";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const generateEncode = (props: airtable_request_type) => {
  let encode = '?' + (props?.view != undefined ? `view=${props.view}&`: '') + (props?.formula ? `filterByFormula=${props.formula}&`: '')
  if (props?.fields != undefined) {
    let encoded_fields: string[] = []
    props.fields.map((field) => encoded_fields.push(`fields=${field}`))
    encode += encoded_fields.join('&')
  }
    encode += props.offset != undefined ? `&offset=${props.offset}` : ''
  return encode
}

export const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})