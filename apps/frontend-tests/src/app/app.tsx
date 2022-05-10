// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import NxWelcome from './nx-welcome';
import { gql, useQuery } from '@apollo/client';
import { ReactElement, JSXElementConstructor, ReactFragment, ReactPortal } from 'react';

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
return `http://localhost:${graphqlPort}/graphql`;
}

const ME = gql`
query GetLanguages {
  getLanguages {
    alpha_2
    name
  }
}
`;

export function App() {

  const { loading, error, data } = useQuery(ME);

  if (loading) return (
    <progress className="progress is-large is-info" max="100">60%</progress>
  );
  if (error) return (
    <div className="notification is-danger">
      <button className="delete"></button>
        ${error.message}
    </div>
  );

  return (
    <>
      <div>
      <table className="table">
          <thead>
            <tr>
              <th>alpha_2</th>
              <th>name</th>
            </tr>
          </thead>
          <tbody>
            {data && data.getLanguages.map((language: { alpha_2: string; name: string; }) => (
              <tr>
                <td>{language.alpha_2}</td>
                <td>{language.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div />
    </>
  );
}

export default App;
