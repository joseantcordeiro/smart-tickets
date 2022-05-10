import { StrictMode } from 'react';
import SuperTokens from 'supertokens-auth-react';
import Session, { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { BrowserRouter } from 'react-router-dom';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import { getAuthDomain, getWebsiteDomain } from "./app/common/utils"
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

SuperTokens.init({
  appInfo: {
      appName: "Smart Tickets",
      apiDomain: getAuthDomain(),
      websiteDomain: getWebsiteDomain(),
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
  },
  recipeList: [
      EmailPassword.init(),
      Session.init()
  ]
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <SessionAuth>
        <App />
      </SessionAuth>
    </BrowserRouter>
  </StrictMode>
);
