import { gql, useQuery } from "@apollo/client";

const TEAMS = gql`
query Teams {
  teams {
    id
    name
    description
    roles
    belongsTo {
      id
      name
    }
    members {
      id
      name
      email
      picture
    }
  }
}
`;

export default function Teams() {
  const { loading, error, data } = useQuery(TEAMS);

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
            <li className="is-active"><a href="/teams" aria-current="page">Teams</a></li>
            <li><button className="button is-small">Create Team</button></li>
          </ul>
        </nav>
      </div>
      <section className="hero">
        <div className="hero-body">
          <div className="container">
            <div className="card">
              <div className="card-content">
                <div className="content">
                  <div className="control has-icons-left has-icons-right search-field">
                    <input className="input is-large" type="text" placeholder="" v-model="search" /><span className="icon is-medium is-left"><i className="fa fa-search"></i></span>
                    <span className="icon is-medium is-right">
                      <i className="delete is-medium clear-search" v-if="search.length"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    <div className="box">
        {data.teams.map((item: { id: string; name: string; description: string; roles: [string]; belongsTo: [{ id: string; name: string;}]}) => (
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">
            {item.belongsTo[0].name} / {item.name}
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
              Roles: <a href="#">{item.roles}</a>. <a href="#">#css</a> <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">Members</a>
            <a href="#" className="card-footer-item">Roles</a>
            <a href="#" className="card-footer-item">Settings</a>
            <a href="#" className="card-footer-item">Delete</a>
          </footer>
        </div>

        ))}
      </div>
    </div>
  );
}
