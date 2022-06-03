import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginInlineTrace } from 'apollo-server-core';
import express = require('express');
import http = require('http');
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { BaseRedisCache } from 'apollo-server-cache-redis';
import Redis from 'ioredis';
import { graphqlUploadExpress } from "graphql-upload";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import { Neo4jGraphQLAuthJWKSPlugin } from "@neo4j/graphql-plugin-auth";
import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { SessionRequest } from "supertokens-node/framework/express";
import { typeDefs } from './typesDef';
import { resolvers } from './resolvers';
import { GraphqlLoggerPlugin } from './plugins/GraphqlLoggerPlugin';
import env = require("dotenv");
env.config();

supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: String(process.env.AUTH_URI),
    apiKey: process.env.AUTH_API_KEY,
  },
  appInfo: {
      appName: String(process.env.AUTH_APP_NAME),
      apiDomain: String(process.env.AUTH_API_DOMAIN),
      websiteDomain: String(process.env.AUTH_WEBSITE_DOMAIN),
      // apiBasePath: "/auth",
      // websiteBasePath: "/auth",
  },
  recipeList: [
      EmailPassword.init(), // initializes signin / sign up features
      Session.init() // initializes session features
  ]
});

export const driver = neo4j.driver(
  String(process.env.NEO4J_URI),
  neo4j.auth.basic(String(process.env.NEO4J_USER), String(process.env.NEO4J_PASSWORD))
);

const neoSchema = new Neo4jGraphQL({
	typeDefs,
  resolvers,
	plugins: {
		auth: new Neo4jGraphQLAuthJWKSPlugin({
				jwksEndpoint: String(process.env.API_JWT_URL),
		})
	},
	driver });

async function startApolloServer() {

  // Required logic for integrating with Express
  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = await neoSchema.getSchema();

  const serverCleanup = useServer({
    schema
  }, wsServer);

  app.use(graphqlUploadExpress());

  // Same ApolloServer initialization as before, plus the drain plugin.

  const server = new ApolloServer({
		schema,
    context: ({ req, res }) => ({ req, res, driver }),
    /** context: async (req: SessionRequest) => {
      return {
        jwt: req.session?.getAccessTokenPayload()["jwt"],
        driver
      };
    }, */
    cache: new BaseRedisCache({
      client: new Redis({
        host: String(process.env.CACHE_HOST),
        port: Number(process.env.CACHE_PORT),
        password: String(process.env.CACHE_PASSWORD),
        db: Number(process.env.CACHE_DB),
      }),
    }),
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      GraphqlLoggerPlugin,
      ApolloServerPluginInlineTrace,
		],
    csrfPrevention: true,
    /**dataSources: () => {
      return {
        gethAPI: new gethAPI(),
      };
    },*/
	});

  // More required logic for integrating with Express
  await server.start();

  server.applyMiddleware({
    app,
    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: '/graphql',
  });

  app.get("/TokenPayload", verifySession(), async (req: SessionRequest, res) => {

    // The key "role" is used here since we used that
    // while setting the access token payload
    res.json({ token: req.session?.getAccessTokenPayload() })

    //....
  });

  // Modified server startup
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

}

export default startApolloServer;
