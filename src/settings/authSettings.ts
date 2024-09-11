import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { ENVIROMENT } from './enviroment';

const { MS_CLIENT_ID, MS_REDIRECT_URI, MS_TENANT_ID } = ENVIROMENT;
// MSAL = Microsoft Authorization Library
const msalConfig: Configuration = {
  auth: {
    clientId: MS_CLIENT_ID, // Client ID obtenido desde Microsoft Entra ID
    authority: `https://login.microsoftonline.com/${MS_TENANT_ID}`,
    redirectUri: MS_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
