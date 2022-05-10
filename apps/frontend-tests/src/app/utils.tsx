export function getAuthDomain(): string {
  const authPort = 4001;
  return `http://localhost:${authPort}`;
}

export function getWebsiteDomain(): string {
  const websitePort = 4200;
  return `http://localhost:${websitePort}`;
}

export function getGraphqlApi(): string {
const graphqlPort = 4000;
return `http://localhost:${graphqlPort}`;
}

export function getMinioDomain(): string {
const minioPort = 9000;
return `http://192.168.1.95:${minioPort}`;
}
