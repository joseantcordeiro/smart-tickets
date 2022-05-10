import { gql, useQuery } from '@apollo/client';
import Nav from "../common/nav";

const ME = gql`
query Me {
  me {
    id
    name
    email
    picture
  }
  getLanguages {
    alpha_2
    name
  }
}
`;

export default function Dashboard() {
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

  return(
    <div>
      <div className="box">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li key="home"><a href="/">${data.me.name}</a></li>
            <li className="is-active"><a href="/" aria-current="page">Dashboard</a></li>
          </ul>
        </nav>
      </div>

      <div className="columns is-mobile">
        <div className="column is-three-quarters-mobile is-two-thirds-tablet is-half-desktop is-one-third-widescreen is-one-quarter-fullhd">
          <aside className="menu">
            <p className="menu-label">
              General
            </p>
            <ul className="menu-list">
              <li><a>Dashboard</a></li>
              <li><a>Customers</a></li>
            </ul>
            <p className="menu-label">
              Administration
            </p>
            <ul className="menu-list">
              <li><a>Team Settings</a></li>
              <li>
                <a className="is-active">Manage Your Team</a>
                <ul>
                  <li><a>Members</a></li>
                  <li><a>Plugins</a></li>
                  <li><a>Add a member</a></li>
                </ul>
              </li>
              <li><a>Invitations</a></li>
              <li><a>Cloud Storage Environment Settings</a></li>
              <li><a>Authentication</a></li>
            </ul>
            <p className="menu-label">
              Transactions
            </p>
            <ul className="menu-list">
              <li><a>Payments</a></li>
              <li><a>Transfers</a></li>
              <li><a>Balance</a></li>
            </ul>
          </aside>
        </div>
        <div className="column">
          <div className="container is-fluid">
            <nav className="level is-mobile">
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Tweets</p>
                  <p className="title">3,456</p>
                </div>
              </div>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Following</p>
                  <p className="title">123</p>
                </div>
              </div>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Followers</p>
                  <p className="title">456K</p>
                </div>
              </div>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Likes</p>
                  <p className="title">789</p>
                </div>
              </div>
            </nav>

          </div>
        </div>
      </div>
    </div>
  );
}
