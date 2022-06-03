FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/auth-rest-api .
COPY ./apps/auth-rest-api/.env ./
# COPY package.json package-lock.json ./
ENV PORT=4001
EXPOSE ${PORT}
# RUN npm install --production
# dependencies that express needs
RUN npm install fastify @fastify/cors @fastify/formbody supertokens-node neo4j-driver dotenv
CMD node ./main.js
