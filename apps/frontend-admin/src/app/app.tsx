import React from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { ApolloClient, InMemoryCache, ApolloProvider, DefaultOptions } from "@apollo/client";
import AppRoutes from "./common/routes";
import { getGraphqlApi } from "./common/utils";
import Footer from "./common/footer";

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

function App() {
  const { accessTokenPayload } = useSessionContext();
  const client = new ApolloClient({
    uri: getGraphqlApi(),
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${accessTokenPayload?.jwt}`,
      Cookie: `${accessTokenPayload}`,
      "Content-Type": "application/json",
    },
    defaultOptions,
  });
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <AppRoutes />
      </ApolloProvider>
      <Footer />
    </div>
  );
}

export default App;
