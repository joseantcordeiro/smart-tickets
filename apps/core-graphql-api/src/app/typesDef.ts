import { gql } from 'apollo-server-express';

export const typeDefs = gql`

  enum Roles {
    MANAGE_ORGANIZATIONS
    MANAGE_TEAMS
    MANAGE_USERS
    MANAGE_STAFF
    MANAGE_CHANNELS
    MANAGE_DISCOUNTS
    MANAGE_GIFT_CARDS
    MANAGE_ORDERS
    MANAGE_PRODUCTS
    MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES
    HANDLE_PAYMENTS
    MANAGE_SHIPPING
    MANAGE_SETTINGS
    MANAGE_CHECKOUTS
    HANDLE_CHECKOUTS
    MANAGE_EVENTS
  }

  enum EventType {
    ONLINE
    IN_PERSON
  }

  enum PriceModel {
    FEE
    FREE
  }

  enum OrganizationConfigurationItems {
    BASE_URL
  }

  scalar JSON
  scalar Upload

  type FileUploadResponse @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    ETag: String!
    Location: String!
    key: String!
    Bucket: String!
  }

  type PictureUrl @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    pictureUrl: String!
  }

  type Account @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: ID!
    did: String!
    name: String!
    namespace: String!
    type: String!
    address: String!
    password: String!
  }

  type Pool @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: ID!
    connector: String
    created: String
    decimals: Int
    key: String
    locator: String
    message: String
    name: String
    namespace: String
    standard: String
    state: String
    symbol: String
    type: String
    tickets: [Ticket!]! @relationship(type: "IS_TOKEN", direction: IN)
  }

  type Ticket @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: ID!
    from: String
    key: String
    namespace: String
    tokenIndex: String
    pool: [Pool!]! @relationship(type: "IS_TOKEN", direction: OUT)
  }

  type FireFlyTokenBalanceResponse @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    balance: String
    connector: String
    key: String
    namespace: String
    pool: String
    tokenIndex: String
    updated: String
    uri: String
  }

  type GethAccounts @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    address: [String]
  }

  type Country @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    iso_2: String @unique(constraintName: "unique_iso_2")
    iso_3: String
    num_code: String
    name: String
    display_name: String
  }

  type Language @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    alpha_2: String @unique(constraintName: "unique_alpha_2")
    name: String
  }

  type Currency @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    code: String @unique(constraintName: "unique_code")
    symbol: String
    symbol_native: String
    name: String
  }

  type Organization @exclude(operations: [CREATE, DELETE]) {
		id: ID! @id(unique: true)
    name: String!
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    owner: [Person!]! @relationship(type: "OWNS", direction: IN)
    workers: [Person!]! @relationship(type: "WORKS_IN", direction: IN)
    defaultLanguage: [Language!]! @relationship(type: "HAS_DEFAULT_LANGUAGE", direction: OUT)
    defaultCountry: [Country!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: OUT)
    defaultCurrency: [Currency!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: OUT)
    channels: [Channel!]! @relationship(type: "BELONGS_TO", direction: IN)
    teams: [Team!]! @relationship(type: "BELONGS_TO", direction: IN)
    accounts: [Account!]! @relationship(type: "HAS_BUSINESS_ACCOUNT", direction: OUT)
    pools: [Pool!]! @relationship(type: "BELONGS_TO", direction: IN)
  }

  type Person @exclude(operations: [CREATE, UPDATE, DELETE]) {
		id: ID! @id(unique: true)
    name: String
		email: String!
    picture: String
    roles: [String!]
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    owns: [Organization!]! @relationship(type: "OWNS", direction: OUT)
    organizations: [Organization!]! @relationship(type: "WORKS_IN", direction: OUT)
    defaultLanguage: [Language!]! @relationship(type: "HAS_DEFAULT_LANGUAGE", direction: OUT)
    teamMember: [Team!]! @relationship(type: "MEMBER_OF", direction: OUT)
    groupMember: [Group!]! @relationship(type: "MEMBER_OF", direction: OUT)
    accounts: [Account!]! @relationship(type: "HAS_PERSONAL_ACCOUNT", direction: OUT)
  }

  type Me @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: String!
    name: String
    email: String!
    picture: String
    roles: [String!]
    language: String
    defaultOrganization: String
  }

  type Metadata @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    key: String!
    value: String
  }

  type Channel @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String!
    description: String
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    belongsTo: [Organization!]! @relationship(type: "BELONGS_TO", direction: OUT)
    defaultLanguage: [Language!]! @relationship(type: "HAS_DEFAULT_LANGUAGE", direction: OUT)
    defaultCountry: [Country!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: OUT)
    defaultCurrency: [Currency!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: OUT)
    groups: [Group!]! @relationship(type: "BELONGS_TO", direction: IN)
    events: [Event!]! @relationship(type: "AVAILABLE_IN", direction: IN)
  }

  type Team @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String!
    description: String
    roles: [String!]!
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    belongsTo: [Organization!]! @relationship(type: "BELONGS_TO", direction: OUT)
    members: [Person!]! @relationship(type: "MEMBER_OF", direction: IN)
  }

  type Group @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String!
    description: String
    emailDomain: String
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    members: [Person!]! @relationship(type: "MEMBER_OF", direction: IN)
    channel: [Channel!]! @relationship(type: "BELONGS_TO", direction: OUT)
  }

  type Location @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    location: String!
    latitude: Float!
    longitude: Float!
  }

  type Event @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String!
    description: String!
    displayName: String!
    priceModel: String
    price: Float
    taxes: Float
    operationFee: Float
    tags: [String!]
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    belongsTo: [Organization!]! @relationship(type: "BELONGS_TO", direction: OUT)
    location: [Location!]! @relationship(type: "LOCATED_IN", direction: OUT)
    currency: [Currency!]! @relationship(type: "HAS_CURRENCY", direction: OUT)
    availableIn: [Channel!]! @relationship(type: "AVAILABLE_IN", direction: OUT)
  }

  type Category @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
  }

  type Test @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String
    json: JSON
  }

	type Query {
    me: Me
        @cypher(statement: """
        MATCH (u:Person { id: $auth.jwt.sub })-[:HAS_METADATA]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
        MATCH (u)-[:HAS_DEFAULT_LANGUAGE]->(l:Language)
        RETURN u {
          .*,
          language: l.alpha_2,
          defaultOrganization: m.value
        } AS me
        """)
        @auth(rules: [{
          isAuthenticated: true,
          operations: [READ],
          allow: { id: "$jwt.sub" }
        }])
	}

  type Query {
    currentRoles: [String]
        @cypher(statement: "MATCH (p:Person { id: $auth.jwt.sub }) RETURN p.roles")
        @auth(rules: [{ isAuthenticated: true }])
  }

  type Query {
    currentOrganization: [String]
        @cypher(statement: "MATCH (p:Person { id: $auth.jwt.sub })-[:HAS_METADATA { private: true, deleted: false }]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' }) RETURN m.value")
        @auth(rules: [{ isAuthenticated: true }])
  }

  type Query {
    publicMetadata(objectId: String): [Metadata!]
        @cypher(statement: """
        MATCH (n { id: $objectId })-[:HAS_METADATA { private: false, deleted: false }]->(m:Metadata)
        RETURN m
        """)
        @auth(rules: [{ isAuthenticated: false }])
  }

  type Query {
    privateMetadata(objectId: String): [Metadata!]
        @cypher(statement: """
        MATCH (n { id: $objectId })-[:HAS_METADATA { private: true, deleted: false }]->(m:Metadata)
        RETURN m
        """)
        @auth(rules: [{ isAuthenticated: true }])
  }

  type Query {
    getLanguages: [Language!]
        @cypher(statement: """
        MATCH (l:Language)
        RETURN l
        """)
        @auth(rules: [{ allowUnauthenticated: true }])
  }

  type Query {
    getContries: [Country!]
        @cypher(statement: """
        MATCH (c:Country)
        RETURN c
        """)
        @auth(rules: [{ allowUnauthenticated: true }])
  }

  type Query {
    getCurrencies: [Currency!]
        @cypher(statement: """
        MATCH (c:Currency)
        RETURN c
        """)
        @auth(rules: [{ allowUnauthenticated: true }])
  }

  type Query {
    myAccounts: [Account]
        @cypher(statement: """
        MATCH (p:Person { id: $auth.jwt.sub })-[:HAS_PERSONAL_ACCOUNT]->(a:Account)
        RETURN a {
          .*
        } AS account
        """)
        @auth(rules: [{ isAuthenticated: true }])
  }

  type Query {
    balanceEURO(address: String!): [FireFlyTokenBalanceResponse]
  }

  type Query {
    balanceUSD(address: String!): [FireFlyTokenBalanceResponse]
  }

  type Query {
    balanceTICKETS(pool: String!): [FireFlyTokenBalanceResponse]
  }

  type Mutation {
    signUp(
      uuid: String!,
      name: String,
      email: String!,
      defaultLanguage: String!
      ): Person
        @cypher(statement: """
        MATCH (l:Language { alpha_2: $defaultLanguage })
        CREATE (p:Person { id: $uuid, name: $name, email: $email, roles: ['MANAGE_ORGANIZATIONS'] })
        CREATE (p)-[:HAS_DEFAULT_LANGUAGE]->(l)
        CREATE (m:Metadata { key: 'DEFAULT_ORGANIZATION', value: '' })
        CREATE (p)-[:HAS_METADATA { createdBy: $uuid, createdAt: datetime(), private: true, deleted: false }]->(m)
        RETURN p
        """)
        @auth(rules: [{ isAuthenticated: true }])
  }

  type Mutation {
    createOrganization(
      name: String!,
      defaultCurrency: String!,
      defaultLanguage: String!,
      defaultCountry: String!
      ): Organization
        @cypher(statement: """
        MATCH (p:Person {id: $auth.jwt.sub}), (a:Currency { code: $defaultCurrency }), (c:Country { iso_2: $defaultCountry }), (l:Language { alpha_2: $defaultLanguage })
        WITH p, a, c, l
        CREATE (o:Organization { id: randomUUID(), name: $name})
        CREATE (p)-[:OWNS { createdAt: datetime(), deleted: false}]->(o)
        CREATE (p)-[:WORKS_IN { active: true, since: datetime() }]->(o)
        CREATE (o)-[:HAS_DEFAULT_COUNTRY]->(c)
        CREATE (o)-[:HAS_DEFAULT_CURRENCY]->(a)
        CREATE (o)-[:HAS_DEFAULT_LANGUAGE]->(l)
        CREATE (m:Channel { id: randomUUID(), name: 'default-channel' })
        CREATE (m)-[:BELONGS_TO { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]->(o)
        CREATE (m)-[:HAS_DEFAULT_COUNTRY]->(c)
        CREATE (m)-[:HAS_DEFAULT_CURRENCY]->(a)
        CREATE (m)-[:HAS_DEFAULT_LANGUAGE]->(l)
        WITH o, p
        MATCH (p)-[:HAS_METADATA]->(d:Metadata { key: 'DEFAULT_ORGANIZATION' })
        SET d.value = o.id
        RETURN o
        """)
        @auth(rules: [{
          isAuthenticated: true,
          roles: ["MANAGE_ORGANIZATIONS"]
        }])
  }

  type Mutation {
    createChannel(
      organizationId: String!,
      name: String!,
      description: String,
      ): Channel
        @cypher(statement: """
        MATCH (p:Person { id: $auth.jwt.sub }), (o:Organization { id: $organizationId })
        WITH p, o, randomUUID() AS uuid
        CREATE (c:Channel { id: uuid, name: $name, description: $description })
        MERGE (c)-[:BELONGS_TO { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]->(o)
        RETURN c
        """)
        @auth(rules: [{
          isAuthenticated: true,
          roles: ["MANAGE_ORGANIZATIONS", "MANAGE_CHANNELS"]
        }])
  }

  type Mutation {
    createTeam(
      organizationId: String!,
      name: String!,
      description: String,
      roles: [String!]!,
      ): Team
        @cypher(statement: """
        MATCH (p:Person { id: $auth.jwt.sub }), (o:Organization { id: $organizationId })
        WITH p, o, randomUUID() AS uuid
        CREATE (t:Team { id: uuid, name: $name, description: $description, roles: $roles })
        MERGE (t)-[:BELONGS_TO { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]->(o)
        RETURN t
        """)
        @auth(rules: [{
          isAuthenticated: true,
          roles: ["MANAGE_ORGANIZATIONS", "MANAGE_TEAMS"]
        }])
  }

  type Mutation {
    createGroup(
      channelId: String!,
      name: String!,
      description: String,
      emailDomain: String,
      ): Team
        @cypher(statement: """
        MATCH (p:Person { id: $auth.jwt.sub }), (c:Channel { id: $channelId })
        WITH p, c, randomUUID() AS uuid
        CREATE (g:Group { id: uuid, name: $name, description: $description, emailDomain: $emailDomain })
        MERGE (g)-[:BELONGS_TO { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]->(c)
        RETURN g
        """)
        @auth(rules: [{
          isAuthenticated: true,
          roles: ["MANAGE_ORGANIZATIONS", "MANAGE_CHANNELS"]
        }])
  }

  type Mutation {
    createEvent(
      organizationId: String!,
      name: String!,
      description: String,
      type: String,
      location: String
      latitude: Float,
      longitude: Float,
      startDate: Date,
      endDate: Date,
      timeZone: String,
      logo: String,
      cover: String,
      priceModel: String,
      price: Float,
      currency: String
      taxes: Float,
      operationFee: Float,
      tags: [String!]
      ): Event
        @cypher(statement: """
        MATCH (o:Organization { id: $organizationId }), (a:Currency { code: $currency })
        WITH o, a, randomUUID() AS uuid
        CREATE (e:Event { id: uuid, name: $name, description: $description, priceModel: $priceModel, price: $price, taxes: $taxes, operationFee: $operationFee })
        CREATE (e)-[HAS_CURRENCY { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]->(a)
        CREATE (l:Location { id: randomUUID(), name: $location, location: Point($latitude, $longitude) })
        CREATE (e)-[:LOCATED_IN { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]->(l)
        CREATE (o)<-[:BELONGS_TO { createdBy: $auth.jwt.sub, createdAt: datetime(), active: true, deleted: false }]-(e)
        CREATE (e)<-[:STARTED_AT { startDate: $startDate, endDate: $endDate, timeZone: $timeZone }]-(o)
        CREATE (m:Metadata { key: 'EVENT_TYPE', value: $type })
        CREATE (e)-[:HAS_METADATA { createdBy: $auth.jwt.sub, createdAt: datetime(), private: false, deleted: false }]->(m)
        CREATE (m1:Metadata { key: 'LOGO', value: $logo })
        CREATE (e)-[:HAS_METADATA { createdBy: $auth.jwt.sub, createdAt: datetime(), private: false, deleted: false }]->(m1)
        CREATE (m2:Metadata { key: 'COVER', value: $cover })
        CREATE (e)-[:HAS_METADATA { createdBy: $auth.jwt.sub, createdAt: datetime(), private: false, deleted: false }]->(m2)
        RETURN e
        """)
        @auth(rules: [{
          isAuthenticated: true,
          roles: ["MANAGE_ORGANIZATIONS", "MANAGE_CHANNELS", "MANAGE_EVENTS"]
        }])
  }

  type Mutation {
    createBlockchainAccount(personId: String!): Account!
  }

  type Mutation {
    createBusinessAccount(organizationId: String!): Account!
  }

  type Mutation {
    createTicketPool(organizationId: String!): Pool!
  }

  type Mutation {
    createTicket(poolId: String!): Ticket!
  }

  type Mutation {
    transferTicket(poolId: String!, to: String!): Ticket!
  }

  type Query {
    getBlockchainAccounts: GethAccounts
  }

  type Mutation {
    setDefaultOrganization(
      organizationId: String!
    ): Metadata!
  }

  type Query {
    otherFields: Boolean!
  }

  type Mutation {
    fileUpload(file: Upload!): PictureUrl!
  }

  type Mutation {
    createTest(name: String!, defaultLanguage: String, json: JSON): Test
  }

  type Query {
    test(name: String): Test
  }

`;
