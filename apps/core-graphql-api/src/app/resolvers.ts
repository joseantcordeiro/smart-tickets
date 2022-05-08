import { ApolloError } from "apollo-server-express";
import { GraphQLUpload } from "graphql-upload";
import { createUploadStream } from "./upload/streams"
import { Logger } from "./utils/logger";

export const resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    fileUpload: async (_source, { file }, context) => {
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

      const session = context.driver.session();
      const res = await session.writeTransaction(tx =>
        tx.run(`
          MATCH (p:Person { id: $auth.jwt.sub })
          SET p.picture = $filename
          RETURN t {
            .*
          } AS test
        `,
        { filename }
        )
      );
      session.close();
      if (res.records.length === 0) {
        Logger.error("Error writing uploading file");
        throw new ApolloError("Error uploading file");
      }

      return result;
    },
    createTest: async (_source, { name, defaultLanguage }, context) => {
      Logger.info("createTest", { name, defaultLanguage });
      const session = context.driver.session();
      const res = await session.writeTransaction(tx =>
        tx.run(`
            MATCH (l:Language { alpha_2: $defaultLanguage })
            CREATE (t:Test { id: randomUUID(), name: $name})
            CREATE (t)-[:HAS_DEFAULT_LANGUAGE]->(l)
            RETURN t {
              .*
            } AS test
          `,
          { name, defaultLanguage }
        )
      );
      const test = res.records.length === 0 ? false : res.records[0].get('test');
      session.close();
      if (test === false) {
        throw new Error(`Test ${name} can't not be created!`)
      }

      return test;
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
    }
  }
};
