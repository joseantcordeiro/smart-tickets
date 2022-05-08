import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginInlineTrace } from 'apollo-server-core';
import express = require('express');
import http = require('http');
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { BaseRedisCache } from 'apollo-server-cache-redis';
import Redis from 'ioredis';
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import { Neo4jGraphQLAuthJWKSPlugin } from "@neo4j/graphql-plugin-auth";
import { typeDefs } from './typesDef';
import { resolvers } from './resolvers';
import env = require("dotenv");
import { GraphqlLoggerPlugin } from './plugins/GraphqlLoggerPlugin';
env.config();

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

  // Same ApolloServer initialization as before, plus the drain plugin.

  const server = new ApolloServer({
		schema,
    context: ({ req }) => ({ req, driver }),
    /**context: async req => {
      const { res } = req;
      const session = await Session.getSession(req, res)
      console.log(session);
      if (session === undefined) {
        throw Error("Should never come here")
      }
      const jwt = session.getAccessTokenPayload()["jwt"];
      JsonWebToken.verify(jwt, jwtCertificate(), function (err, decoded) {
        const token = decoded as JwtPayload;
        console.log(token);
        return {
          jwt: token,
        };
      });
    },*/
    cache: new BaseRedisCache({
      client: new Redis({
        host: String(process.env.REDIS_HOST),
        port: Number(process.env.REDIS_PORT),
        password: String(process.env.REDIS_PASSWORD),
        db: Number(process.env.REDIS_DB),
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

  // Modified server startup
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

}

export default startApolloServer;
