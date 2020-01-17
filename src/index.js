import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

//importing apollo dependencies
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";

//importing router
import { BrowserRouter } from "react-router-dom";

//auth token
import { AUTH_TOKEN } from "./constants";

//importing apollo link dependencies
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

//create httpLink that connects ApolloClient with graphQL API
//server runs at localhost:4000, uri is the endpoint
const httpLink = createHttpLink({
  uri: "http://localhost:4000"
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

//instantiate WebSocketLink passing subscriptions endpoint.
//authenticate connection with auth token
const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000",
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
});

//split routes request to specific link
//check if operation is subscription, if true, request forwards to first link, if false, forwards to second
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  authLink.concat(httpLink)
);

//instantiate ApolloClient passing in httpLink and InMemoryCache instance
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

//wrap App in ApolloProvider, passing client as prop
//wrap app in BrowserRouter so all child components will have access to routing
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
