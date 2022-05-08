import { Logger } from "../utils/logger";

export const GraphqlLoggerPlugin = {

  // Fires whenever a GraphQL request is received from a client.

  async requestDidStart(requestContext) {

    Logger.info('GraphQL Request started!');

    return {

      async didEncounterErrors(requestContext) {
        Logger.error('GraphQL Request finished with errors!' + requestContext.errors);
      },

    }
  },
};
