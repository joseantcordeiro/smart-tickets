import { gql, useQuery } from "@apollo/client";

const MYACCOUNTS = gql`
query MyAccounts {
  myAccounts {
    id
    did
    name
    namespace
    type
    address
    password
  }
}
`;

export default function Accounts() {
  const { loading, error, data } = useQuery(MYACCOUNTS);

  if (loading) return (
    <progress className="progress is-large is-info" max="100">60%</progress>
  );
  if (error) return (
    <div className="notification is-danger">
      <button className="delete"></button>
        ${error.message}
    </div>
  );

  return(
    <div>
      <div className="box">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/account" aria-current="page">Account</a></li>
            <li className="is-active"><a href="/account/accounts" aria-current="page">My Accounts</a></li>
            <li><button className="button is-small">Create Account</button></li>
          </ul>
        </nav>
      </div>
    <div className="box">
        {data.myAccounts.map((item: { id: string; did: string, name: string; namespace: string; address: string;}) => (
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">
              {item.did}
            </p>
            <button className="card-header-icon" aria-label="more options">
              <span className="icon">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </header>
          <div className="card-content">
            <div className="content">
              <div className="tags">

              </div>
              {item.name}
              <br />
              <a href="#">{item.address}</a>. <a href="#">{item.namespace}</a> <a href="#">{item.id}</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">Balances</a>
            <a href="#" className="card-footer-item">Settings</a>
            <a href="#" className="card-footer-item">Delete</a>
          </footer>
        </div>

        ))}
      </div>
    </div>
  );
}
