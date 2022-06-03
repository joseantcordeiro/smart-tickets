import { ApolloError } from "apollo-server-express";
import Session from "supertokens-node/recipe/session";
import { GraphQLUpload } from "graphql-upload";
import GraphQLJSON = require('graphql-type-json');
import { createUploadStream } from "./upload/streams"
import { Logger } from "./utils/logger";
import BlockchainAPI from "./apis/blockchain";
const blockchain = new BlockchainAPI();

export const resolvers = {
  JSON: GraphQLJSON,
  Upload: GraphQLUpload,
  Mutation: {
    fileUpload: async (_source, { file }, context) => {
      const session = await Session.getSession(context.req, context.res);
      if (session === undefined) {
        throw new Error("Should never come here")
      }
      const userId = session.getUserId();

      const { filename, createReadStream } = await file;

      const stream = createReadStream();

      let result;

      try {
        const uploadStream = createUploadStream(filename);
        stream.pipe(uploadStream.writeStream);
        result = await uploadStream.promise;
      } catch (error) {
        Logger.error(
          `[Error]: Message: ${error.message}, Stack: ${error.stack}`
        );
        throw new ApolloError("Error uploading file");
      }

      const pictureUrl = result.Bucket + "/" + filename;

      const neo4j = context.driver.session();
      const res = await neo4j.writeTransaction(tx =>
        tx.run(`
          MATCH (p:Person { id: $userId })
          SET p.picture = $pictureUrl
          RETURN p.picture AS pictureUrl
        `,
        { userId, pictureUrl }
        )
      );
      neo4j.close();
      if (res.records.length === 0) {
        Logger.error("Error registered for uploading file");
        throw new ApolloError("Error registered for uploading file");
      }

      return res.records[0].get('pictureUrl');
    },
    createTest: async (_source, { name, defaultLanguage, json }, context) => {
      Logger.info("createTest", { name, defaultLanguage });
      const session = context.driver.session();
      const res = await session.writeTransaction(tx =>
        tx.run(`
            MATCH (l:Language { alpha_2: $defaultLanguage })
            CREATE (t:Test { id: randomUUID(), name: $name, json: $json })
            CREATE (t)-[:HAS_DEFAULT_LANGUAGE]->(l)
            RETURN t {
              .*
            } AS test
          `,
          { name, defaultLanguage, json }
        )
      );
      const test = res.records.length === 0 ? false : res.records[0].get('test');
      session.close();
      if (test === false) {
        throw new Error(`Test ${name} can't not be created!`)
      }

      return test;
    },
    setDefaultOrganization: async (_source, { organizationId }, context) => {
      const session = await Session.getSession(context.req, context.res);
      if (session === undefined) {
        throw new Error("Should never come here")
      }
      const userId = session.getUserId();
      const neo4j = context.driver.session();
      const res = await neo4j.writeTransaction(tx =>
        tx.run(`
            MATCH (p:Person { id: $userId })-[r:HAS_METADATA { deleted: false }]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
            SET m.value = $organizationId
            SET r.updatedAt = datetime()
            RETURN m {
              .*
            } AS metadata
          `,
          { userId, organizationId }
        )
      )
      const metadata = res.records.length === 0 ? false : res.records[0].get('metadata');
      neo4j.close();
      if (metadata === false) {
        throw new Error(`${organizationId} can't not be set has default organization!`)
      }

      return metadata;
    },
    createBlockchainAccount: async (_source, { personId }, context) => {
      const neo4j = context.driver.session();
      const res = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (p:Person { id: $personId })
            RETURN p {
              .*
            } AS person
          `,
          { personId }
        )
      );
      const person = res.records.length === 0 ? false : res.records[0].get('person');
      if (person === false) {
        throw new Error('Person not found');
      }
      const id: string = person.id;
      const name: string = person.name;
      const email: string = person.email;
      const picture: string = person.picture;

      const gethAccount = await blockchain.createAccount(id, name, email, picture);

      const accountId = gethAccount.id;
      const did = gethAccount.did;
      const accountName = gethAccount.name;
      const namespace = gethAccount.namespace;
      const type = gethAccount.type;
      const address = gethAccount.address;
      const password = gethAccount.password;

      const res1 = await neo4j.writeTransaction(tx =>
        tx.run(`
            MATCH (p:Person { id: $personId })
            WITH p
            CREATE (a:Account { id: $accountId, did: $did, name: $accountName, namespace: $namespace, type: $type, address: $address, password: $password})
            CREATE (p)-[:HAS_PERSONAL_ACCOUNT { createdBy: $personId, createdAt: datetime(), active: true, deleted: false }]->(a)
            RETURN a {
              .*
            } AS account
          `,
          { personId, accountId, did, accountName, namespace, type, address, password }
        )
      );
      const account = res1.records.length === 0 ? false : res1.records[0].get('account');
      neo4j.close();
      if (account === false) {
        throw new Error('Account not created');
      }
      Logger.info(`Account created: ${account.did}`);
      return account;
    },
    createBusinessAccount: async (_source, { organizationId }, context) => {
      const neo4j = context.driver.session();
      const res = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (o:Organization { id: $organizationId })<-[:OWNS]-(p:Person)
            RETURN o {
              .*,
              owner: p.id
            } AS organization
          `,
          { organizationId }
        )
      );
      const organization = res.records.length === 0 ? false : res.records[0].get('organization');
      if (organization === false) {
        throw new Error('Organization not found');
      }
      const id: string = organization.id;
      const name: string = organization.name;
      const owner: string = organization.owner;

      const res0 = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (p:Person { id: $owner })-[:HAS_PERSONAL_ACCOUNT]->(a:Account)
            RETURN a {
              .*
            } AS account
          `,
          { owner }
        )
      );

      const ownerAccount = res0.records.length === 0 ? false : res0.records[0].get('account');
      if (ownerAccount === false) {
        throw new Error('Owner account not found');
      }

      const gethAccount = await blockchain.createBusinessAccount(id, name, ownerAccount.did);

      const accountId = gethAccount.id;
      const did = gethAccount.did;
      const accountName = gethAccount.name;
      const namespace = gethAccount.namespace;
      const type = gethAccount.type;
      const address = gethAccount.address;
      const password = gethAccount.password;

      const res1 = await neo4j.writeTransaction(tx =>
        tx.run(`
            MATCH (o:Organization { id: $organizationId })
            WITH o
            CREATE (a:Account { id: $accountId, did: $did, name: $accountName, namespace: $namespace, type: $type, address: $address, password: $password})
            CREATE (o)-[:HAS_BUSINESS_ACCOUNT { createdBy: $owner, createdAt: datetime(), active: true, deleted: false }]->(a)
            RETURN a {
              .*
            } AS account
          `,
          { organizationId, accountId, did, accountName, namespace, type, address, password, owner }
        )
      );
      const account = res1.records.length === 0 ? false : res1.records[0].get('account');
      neo4j.close();
      if (account === false) {
        throw new Error('Account not created');
      }
      Logger.info(`Account created: ${account.did}`);
      return account;
    },
    createTicketPool: async (_source, { organizationId }, context) => {
      const neo4j = context.driver.session();
      const res = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (o:Organization { id: $organizationId })-[:HAS_BUSINESS_ACCOUNT]-(a:Account)
            RETURN a {
              .*
            } AS account
          `,
          { organizationId }
        )
      );
      const account = res.records.length === 0 ? false : res.records[0].get('account');
      if (account === false) {
        throw new Error('Organization account not found');
      }

      const geth = await blockchain.createTicketPool(account.did, account.address, account.password);

      const poolId = geth.id;
      const poolName = geth.name;
      const namespace = geth.namespace;
      const type = geth.type;
      const locator = geth.locator;
      const address = geth.info.address;

      const res1 = await neo4j.writeTransaction(tx =>
        tx.run(`
            MATCH (o:Organization { id: $organizationId })
            WITH o
            CREATE (p:Pool { id: $poolId, name: $poolName, namespace: $namespace, type: $type, locator: $locator, address: $address })
            CREATE (p)-[:BELONGS_TO { createdAt: datetime(), active: true, deleted: false }]->(o)
            CREATE (p)-[:HAS_METADATA { createdAt: datetime(), private: true, deleted: false }]->(m:Metadata { key: 'TOKEN_INDEX', value: '0'})
            CREATE (p)-[:HAS_METADATA { createdAt: datetime(), private: true, deleted: false }]->(m:Metadata { key: 'TOKEN_INDEX_TRANSFER', value: '0'})
            RETURN p {
              .*
            } AS pool
          `,
          { organizationId, poolId, poolName, namespace, type, locator, address }
        )
      );
      const pool = res1.records.length === 0 ? false : res1.records[0].get('pool');
      neo4j.close();
      if (pool === false) {
        throw new Error('Pool not created');
      }
      Logger.info(`Pool created: ${pool.id}`);
      return pool;
    },
    createTicket: async (_source, { poolId }, context) => {
      const neo4j = context.driver.session();
      const res = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (p:Pool { id: $poolId })-[:BELONGS_TO]->(o:Organization)
            MATCH (p)-[:HAS_METADATA]->(m:Metadata { key: 'TOKEN_INDEX'})
            MATCH (o)-[:HAS_BUSINESS_ACCOUNT]->(a:Account)
            RETURN p {
              .*,
              tokenIndex: m.value,
              did: a.did,
              address: a.address,
              password: a.password
            } AS pool
          `,
          { poolId }
        )
      );
      const pool = res.records.length === 0 ? false : res.records[0].get('pool');
      if (pool === false) {
        throw new Error('Pool not found');
      }

      const geth = await blockchain.mintTicket(pool.name, pool.did, pool.tokenIndex, pool.address, pool.password);

      const mintId = geth.localId;
      const ticketPool = geth.pool;
      const tokenIndex = geth.tokenIndex;
      const from = geth.from;
      const to = geth.to;
      const key = geth.key;

      const tokenIndexInt = String(parseInt(tokenIndex) + 1);

      const res1 = await neo4j.writeTransaction(tx =>
        tx.run(`
            MATCH (p:Pool { id: $ticketPool })-[:HAS_METADATA]->(m:Metadata { key: 'TOKEN_INDEX' })
            WITH p, m
            SET m.value = $tokenIndexInt
            CREATE (t:Ticket { id: $mintId, namespace: 'default', pool: $ticketPool, tokenIndex: $tokenIndex })
            CREATE (t)-[:IS_TOKEN { createdAt: datetime(), active: true, deleted: false }]->(p)
            RETURN t {
              .*
            } AS ticket
          `,
          { ticketPool, mintId, tokenIndexInt, from, to, key, tokenIndex }
        )
      );
      const ticket = res1.records.length === 0 ? false : res1.records[0].get('ticket');
      neo4j.close();
      if (ticket === false) {
        throw new Error('Ticket not created');
      }
      Logger.info(`Ticket created: ${pool.id}`);
      return ticket;
    },
    transferTicket: async (_source, { poolId, to }, context) => {
      const neo4j = context.driver.session();
      const res = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (p:Pool { id: $poolId })-[:BELONGS_TO]->(o:Organization)
            MATCH (p)-[:HAS_METADATA]->(m:Metadata { key: 'TOKEN_INDEX_TRANSFER'})
            MATCH (o)-[:HAS_BUSINESS_ACCOUNT]->(a:Account)
            RETURN p {
              .*,
              tokenIndex: m.value,
              did: a.did,
              address: a.address,
              password: a.password
            } AS pool
          `,
          { poolId }
        )
      );
      const pool = res.records.length === 0 ? false : res.records[0].get('pool');
      if (pool === false) {
        throw new Error('Pool not found');
      }

      const res0 = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (a:Account { address: $to })<-[:HAS_PERSONAL_ACCOUNT]-(p:Person)
            RETURN a {
              .*,
              personId: p.id
            } AS account
          `,
          { to }
        )
      );
      const account = res0.records.length === 0 ? false : res0.records[0].get('account');
      if (account === false) {
        throw new Error('Account not found');
      }

      const geth = await blockchain.transferTicket(pool.name, pool.did, pool.tokenIndex, pool.address, pool.password, account.address, account.did);

      const transferId = geth.localId;
      const ticketPool = geth.pool;
      const tokenIndex = geth.tokenIndex;
      /* const from = geth.from;
      const dest = geth.to;
      const key = geth.key; */
      const personId = account.personId;

      const tokenIndexInt = String(parseInt(tokenIndex) + 1);

      const res1 = await neo4j.writeTransaction(tx =>
        tx.run(`
            MATCH (p:Pool { id: $ticketPool })-[:HAS_METADATA]->(m:Metadata { key: 'TOKEN_INDEX_TRANSFER' })
            MATCH (u:Person { id: $personId}), (t:Ticket { pool: $ticketPool, tokenIndex: $tokenIndex })
            WITH p, m, u, t
            SET m.value = $tokenIndexInt
            CREATE (t)-[:TRANSFERED_TO { transferId: $transferId, createdAt: datetime(), active: true, deleted: false }]->(u)
            RETURN t {
              .*
            } AS ticket
          `,
          { ticketPool, personId, transferId, tokenIndexInt, tokenIndex }
        )
      );
      const ticket = res1.records.length === 0 ? false : res1.records[0].get('ticket');
      neo4j.close();
      if (ticket === false) {
        throw new Error('Ticket not created');
      }
      Logger.info(`Ticket transfered: ${ticket.id}`);
      return ticket;
    }
  },
  Query: {
    test: async (_source, { name }, context) => {
      Logger.info("test", { name });
      const session = context.driver.session();
      const res = await session.readTransaction(tx =>
        tx.run(`
            MATCH (t:Test { name: $name })
            RETURN t {
              .*
            } AS test
          `,
          { name }
        )
      );
      const test = res.records.length === 0 ? false : res.records[0].get('test');
      session.close();
      if (test === false) {
        throw new Error(`Test ${name} can't not be found!`)
      }

      return test;
    },
    getBlockchainAccounts: async (_source, _args, _context) => {
      const gethAccounts = blockchain.getAccounts();
      return gethAccounts;
    },
    balanceEURO: async (_source, { address }, _context) => {
      return blockchain.balanceEURO(address);
    },
    balanceUSD: async (_source, { address }, _context) => {
      return blockchain.balanceUSD(address);
    },
    balanceTICKETS: async (_source, { pool }, context) => {
      const session = await Session.getSession(context.req, context.res);
      if (session === undefined) {
        throw new Error("Should never come here")
      }
      const userId = session.getUserId();
      const neo4j = context.driver.session();
      const res = await neo4j.readTransaction(tx =>
        tx.run(`
            MATCH (p:Person { id: $userId })-[:HAS_PERSONAL_ACCOUNT]->(a:Account)
            RETURN a {
              .*
            } AS account
          `,
          { userId }
        )
      );
      const account = res.records.length === 0 ? false : res.records[0].get('account');
      if (account === false) {
        throw new Error("Account not found")
      }
      return blockchain.balanceTICKETS(pool, account.address);
    }
  }
};
