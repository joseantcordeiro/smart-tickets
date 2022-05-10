// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import SuperTokens from "supertokens-auth-react";
import EmailPassword, { EmailPasswordAuth } from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";
import { useRoutes } from 'hookrouter';
import routes from "./common/router";
import Footer from "./common/footer";
import Nav from "./common/nav";

export function getAuthDomain(): string {
  const authPort = 4001;
  return `http://localhost:${authPort}`;
}

export function getWebsiteDomain(): string {
  const websitePort = 4200;
  return `http://localhost:${websitePort}`;
}

export function getGraphqlApi(): string {
const graphqlPort = 4000;
return `http://localhost:${graphqlPort}`;
}

export function getMinioDomain(): string {
const minioPort = 9000;
return `http://192.168.1.95:${minioPort}`;
}

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

export function App() {
  const routeResult = useRoutes(routes);

  if (SuperTokens.canHandleRoute()) {
    // This renders the login UI on the /auth route
    return SuperTokens.getRoutingComponent()
  }
  return (
    <EmailPasswordAuth>
      <Nav />
      {routeResult}
      <Footer />
    </EmailPasswordAuth>
  );
}

export default App;
