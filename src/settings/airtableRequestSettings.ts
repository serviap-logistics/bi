import { ENVIROMENT } from './enviroment';
const { AIRTABLE_ACCESS_TOKEN } = ENVIROMENT;

export const airtable_request_options = {
  method: 'GET',
  headers: {
    Authorization: 'Bearer ' + AIRTABLE_ACCESS_TOKEN,
  },
};
