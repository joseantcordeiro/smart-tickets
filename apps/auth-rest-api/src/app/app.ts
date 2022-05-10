import fastify from 'fastify';
import cors from '@fastify/cors';
import formDataPlugin from "@fastify/formbody";
import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { errorHandler, plugin, SessionRequest } from "supertokens-node/framework/fastify";
import { verifySession } from "supertokens-node/recipe/session/framework/fastify";
import neo4j from "neo4j-driver";
import env = require("dotenv");
env.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

supertokens.init({
	framework: "fastify",
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
			Session.init({
				jwt: {
					enable: true,
					// issuer: String(process.env.API_JWT_URL),
				},
				override: {
						functions: (originalImplementation) => {
								return {
										...originalImplementation,
										createNewSession: async function (input) {
												const userId = input.userId;

                        const session = driver.session();
                        const res = await session.readTransaction(tx =>
                          tx.run(
                            `MATCH (p:Person { id: $userId })
                             MATCH (p)-[:HAS_METADATA]->(r:Metadata { key: 'DEFAULT_ORGANIZATION' })
                             RETURN p {
                               .*,
                               organization: r.value
                             } AS person`,
                            { userId }
                          )
                        );
                        const user = res.records.length === 0 ? false : res.records[0].get('person');
                        session.close();

                        if (user !== false) {
                          // This goes in the access token, and is availble to read on the frontend.
                          input.accessTokenPayload = {
                              ...input.accessTokenPayload,
                              roles: user.roles,
                              name: user.name,
                              email: user.email,
                              picture: user.picture,
                              organization: user.organization
                          };
                            // This is stored in the db against the sessionHandle for this session
                          input.sessionData = {
                              ...input.sessionData,
                              roles: user.roles,
                              name: user.name,
                              email: user.email,
                              picture: user.picture,
                              organization: user.organization
                          };
                        }

												return originalImplementation.createNewSession(input);
											},
									};
							},
					},
			}) // initializes session features
	]
});


  const app = fastify({
		logger: true
  });

	app.register(cors, {
		origin: [String(process.env.AUTH_WEBSITE_DOMAIN), 'https://studio.apollographql.com'],
		allowedHeaders: ['Content-Type',
		...supertokens.getAllCORSHeaders()],
		credentials: true,
	});

	app.register(formDataPlugin);
	app.register(plugin);

	app.setErrorHandler(errorHandler());

	app.get("/auth/jwt", {
    preHandler: verifySession({ sessionRequired: false }),
		}, (req: SessionRequest, res) => {
				if (req.session !== undefined) {
						const userId = req.session.getUserId();
						const jwt = req.session.getAccessTokenPayload()["jwt"];
						res.send({ user: userId, token: jwt });
				} else {
					res.send({ message: 'user is not logged in...' }); // user is not logged in...
				}
		});

export default app;
