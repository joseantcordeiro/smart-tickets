import { gql } from 'apollo-server-express';

export const typeDefs = gql`

  enum Roles {
    MANAGE_ORGANIZATIONS
    MANAGE_TEAM
    MANAGE_USERS
    MANAGE_STAFF
    MANAGE_CHANNELS
    MANAGE_DISCOUNTS
    MANAGE_GIFT_CARD
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

  scalar Upload

  type FileUploadResponse @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    ETag: String!
    Location: String!
    key: String!
    Key: String!
    Bucket: String!
  }

  type Country @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    iso_2: String @unique(constraintName: "unique_iso_2")
    iso_3: String
    num_code: String
    name: String
    display_name: String
    persons: [Person!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: IN)
    organizations: [Organization!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: IN)
    channels: [Channel!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: IN)
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
    persons: [Person!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: IN)
    organizations: [Organization!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: IN)
    channels: [Channel!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: IN)
  }

  type Organization @exclude(operations: [CREATE, UPDATE, DELETE]) {
		id: ID! @id(unique: true)
    name: String!
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    owner: [Person!]! @relationship(type: "OWNS", direction: IN)
    workers: [Person!]! @relationship(type: "WORKS_IN", direction: IN)
    defaultLanguage: [Language!]! @relationship(type: "HAS_DEFAULT_LANGUAGE", direction: OUT)
    defaultCountry: [Country!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: OUT)
    defaultCurrency: [Currency!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: OUT)
    channels: [Channel!]! @relationship(type: "BELONGS_TO", direction: IN)
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
  }

  type Me @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: String
    name: String
    email: String
    picture: String
    roles: [String!]
    defaultOrganization: String
  }

  type Metadata @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    key: String!
    value: String
  }

  type Channel @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String!
    metadata: [Metadata!]! @relationship(type: "HAS_METADATA", direction: OUT)
    belongsTo: [Organization!]! @relationship(type: "BELONGS_TO", direction: OUT)
    defaultLanguage: [Language!]! @relationship(type: "HAS_DEFAULT_LANGUAGE", direction: OUT)
    defaultCountry: [Country!]! @relationship(type: "HAS_DEFAULT_COUNTRY", direction: OUT)
    defaultCurrency: [Currency!]! @relationship(type: "HAS_DEFAULT_CURRENCY", direction: OUT)
  }

  type Test @exclude(operations: [CREATE, READ, UPDATE, DELETE]) {
    id: ID! @id(unique: true)
    name: String
  }

	type Query {
    me: Me
        @cypher(statement: """
        MATCH (u:Person { id: $auth.jwt.sub })-[:HAS_METADATA]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
        RETURN u {
          .*,
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
        CREATE (m)-[:BELONGS_TO { createdBy: $auth.jwt.sub, createdAt: datetime(), private: false, deleted: false }]->(o)
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
    signup(
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

  type Query {
    otherFields: Boolean!
  }

  type Mutation {
    fileUpload(file: Upload!): FileUploadResponse!
  }

  type Mutation {
    createTest(name: String!, defaultLanguage: String): Test
  }

  type Query {
    test(name: String): Test
  }

`;
