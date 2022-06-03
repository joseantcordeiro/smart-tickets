import { gql, useQuery } from "@apollo/client";

const GROUPS = gql`
query Groups {
  groups {
    id
    name
    description
    emailDomain
    members {
      id
      name
      email
      picture
    }
    channel {
      id
      name
    }
  }
}
`;

export default function Groups() {
  const { loading, error, data } = useQuery(GROUPS);

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
            <li className="is-active"><a href="/groups" aria-current="page">Groups</a></li>
            <li><button className="button is-small">Create Group</button></li>
          </ul>
        </nav>
      </div>
    <div className="box">
        {data.groups.map((item: { id: string; name: string; description: string; emailDomain: string;}) => (
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">
              {item.name} - {item.emailDomain}
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
              {item.description}
              <a href="#">@bulmaio</a>. <a href="#">#css</a> <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">Members</a>
            <a href="#" className="card-footer-item">Channel</a>
            <a href="#" className="card-footer-item">Settings</a>
            <a href="#" className="card-footer-item">Delete</a>
          </footer>
        </div>

        ))}
      </div>
    </div>
  );
}
