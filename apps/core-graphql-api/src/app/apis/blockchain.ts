import { nanoid, customAlphabet } from 'nanoid';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
import FireFly from '@smart-tickets/firefly';
import { Logger } from '../utils/logger';
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:5100"));
const firefly = new FireFly({ host: 'http://localhost:5000' });

class BlockchainAPI {

  async createAccount(id: string, name: string, email: string, picture: string) {

    const password = nanoid();
    const address = await web3.eth.personal.newAccount(password);
    await web3.eth.personal.unlockAccount(address, password, 600);
    const identity = await firefly.postIdentity({
      name: address,
      key: address,
      parent: '5d203b66-dc16-478e-ab44-d9bd891a6c66',
      profile: {
        type: 'Person',
        id: id,
        name: name,
        email: email,
        picture: picture
      }
    }, { confirm: true });
    await web3.eth.personal.lockAccount(address);
    Logger.info(`Identity created: ${identity.did}`);

    // send a notification for account creation
    firefly.sendPrivateMessage({
      data: [
        {
          datatype: {
            name: "Account",
            version: "0.1"
          },
          value: {
            id: identity.id,
            name: identity.name,
            did: identity.did,
            namespace: identity.namespace,
            address: address
          }
        }
      ],
      group: {
        members: [
          {
            identity: identity.did
          }
        ],
      },
      header: {
        tag: "account_created",
        topics: [
          "accounts"
        ],
        type: "private"
      }
    });

    return {
      id: identity.id,
      did: identity.did,
      name: identity.name,
      namespace: identity.namespace,
      type: identity.type,
      address: address,
      password: password };
  }

  async createBusinessAccount(id: string, name: string, owner: string) {

    const password = nanoid();
    const address = await web3.eth.personal.newAccount(password);
    await web3.eth.personal.unlockAccount(address, password, 600);
    const identity = await firefly.postIdentity({
      name: address,
      key: address,
      parent: '5d203b66-dc16-478e-ab44-d9bd891a6c66',
      profile: {
        type: 'Organization',
        id: id,
        name: name
      }
    }, { confirm: true });
    await web3.eth.personal.lockAccount(address);
    Logger.info(`Identity created: ${identity.did}`);

    // send a notification for account creation
    firefly.sendPrivateMessage({
      data: [
        {
          datatype: {
            name: "Account",
            version: "0.1"
          },
          value: {
            id: identity.id,
            name: identity.name,
            did: identity.did,
            namespace: identity.namespace,
            address: address
          }
        }
      ],
      group: {
        members: [
          {
            identity: identity.did
          },
          {
            identity: owner
          }
        ],
      },
      header: {
        tag: "account_created",
        topics: [
          "accounts"
        ],
        type: "private"
      }
    });

    return {
      id: identity.id,
      did: identity.did,
      name: identity.name,
      namespace: identity.namespace,
      type: identity.type,
      address: address,
      password: password };
  }

  async getAccounts() {
    const res = await web3.eth.getAccounts();
    return { address: res };
  }

  async createTicketPool(did: string, address: string, password: string) {
    const code = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 15);
    await web3.eth.personal.unlockAccount(address, password, 600);

    const pool = await firefly.createTokenPool({
      key: address,
      name: code(),
      type: 'nonfungible'
    }, { confirm: true })

    // send a notification for pool creation
    firefly.sendPrivateMessage({
      data: [
        {
          datatype: {
            name: "Pool",
            version: "0.1"
          },
          value: {
            id: pool.id,
            name: pool.name,
            key: pool.key,
            namespace: pool.namespace,
            locator: pool.locator
          }
        }
      ],
      group: {
        members: [
          {
            identity: did
          }
        ],
      },
      header: {
        tag: "pool_created",
        topics: [
          "pools"
        ],
        type: "private"
      }
    });

    await web3.eth.personal.lockAccount(address);
    return pool;
  }

  async mintTicket(poolName: string, did: string, tokenIndex: string, address: string, password: string) {
    await web3.eth.personal.unlockAccount(address, password, 600);

    const mint = await firefly.mintTokens({
        amount: '1',
        key: address,
        pool: poolName,
        to: address,
        tokenIndex: tokenIndex,
    }, { confirm: true });

    // send a notification for pool creation
    firefly.sendPrivateMessage({
      data: [
        {
          datatype: {
            name: "Ticket",
            version: "0.2"
          },
          value: {
            from: mint.from,
            key: mint.key,
            localId: mint.localId,
            namespace: mint.namespace,
            pool: mint.pool,
            tokenIndex: mint.tokenIndex,
          }
        }
      ],
      group: {
        members: [
          {
            identity: did
          }
        ],
      },
      header: {
        tag: "ticket_created",
        topics: [
          "tickets"
        ],
        type: "private"
      }
    });

    await web3.eth.personal.lockAccount(address);
    return mint;
  }

  async transferTicket(poolName: string, did: string, tokenIndex: string, address: string, password: string, to: string, toDid: string) {
    await web3.eth.personal.unlockAccount(address, password, 600);

    const transfer = await firefly.transferTokens({
        amount: '1',
        from: address,
        key: address,
        pool: poolName,
        to: to,
        tokenIndex: tokenIndex,
    }, { confirm: true });

    // send a notification for pool creation
    firefly.sendPrivateMessage({
      data: [
        {
          datatype: {
            name: "Ticket",
            version: "0.2"
          },
          value: {
            from: transfer.from,
            key: transfer.key,
            localId: transfer.localId,
            namespace: transfer.namespace,
            pool: transfer.pool,
            to: transfer.to,
            tokenIndex: transfer.tokenIndex,
          }
        }
      ],
      group: {
        members: [
          {
            identity: did
          },
          {
            identity: toDid
          }
        ],
      },
      header: {
        tag: "ticket_transfer",
        topics: [
          "tickets"
        ],
        type: "private"
      }
    });

    await web3.eth.personal.lockAccount(address);
    return transfer;
  }

  async balanceEURO(address: string) {
    return firefly.getTokenBalances({
      key: address,
      pool: "cb1f9bdf-a5a3-4a2e-af4a-9aa691623d54",
    })
  }

  async balanceUSD(address: string) {
    return firefly.getTokenBalances({
      key: address,
      pool: "f2ef90c2-c54a-4dcb-bebc-cde9b55ff09e",
    })
  }

  async balanceTICKETS(pool: string, address: string) {
    return firefly.getTokenBalances({
      key: address,
      pool: pool,
    })
  }

  async sendPrivateMessage(to: string, message: string) {
    const msg = await firefly.sendPrivateMessage({
      data: [
        {
          datatype: {
            name: "string",
            version: "string"
          },
          id: "string",
          validator: "string",
          value: null
        }
      ],
      group: {
        members: [
          {
            identity: "string",
            node: "string"
          }
        ],
        name: "string"
      },
      header: {
        author: "string",
        cid: "string",
        group: "ZXhhbXBsZQ==",
        key: "string",
        tag: "string",
        topics: [
          "string"
        ],
        txtype: "string",
        type: "private"
      }
    });
    return { type: 'message', id: msg.header.id };
  }
  /*// GET
  async getAPI(method, params) {
    const body = {
      jsonrpc: "2.0",
      id: nanoid(),
      method: method,
      params: params
    }
    return this.get(
      ``, // path
      body, // request body
    );
  }

  // POST
  async postAPI(address: string) {
    const body = {
      name: 'member_' + address,
      key: address,
      parent: '5d203b66-dc16-478e-ab44-d9bd891a6c66',
    };
    return this.post(
      `api/v1/namespaces/default/identities?confirm=true`, // path
      body, // request body
    );
  }*/
}

export default BlockchainAPI;
