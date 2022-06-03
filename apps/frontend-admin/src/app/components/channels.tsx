import { gql, useQuery } from "@apollo/client";

const CHANNELS = gql`
query Channels {
  channels {
    id
    name
    belongsTo {
      id
      name
    }
    groups {
      id
      name
      description
      emailDomain
    }
    defaultLanguage {
      alpha_2
      name
    }
    defaultCountry {
      iso_2
      iso_3
      num_code
      name
      display_name
    }
    defaultCurrency {
      code
      symbol
      symbol_native
      name
    }
  }
}
`;

export default function Channels() {
  const { loading, error, data } = useQuery(CHANNELS);

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
            <li className="is-active"><a href="/channels" aria-current="page">Channels</a></li>
            <li><a className="button is-small" href="/channels/create" aria-current="page">Create Channel</a></li>
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
        {data.channels.map((item: { id: string; name: string; belongsTo: [{ id: string; name: string;}]; defaultCurrency: [{ symbol: string}]; defaultCountry: [{ display_name: string}]; defaultLanguage: [{ name: string}] }) => (
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
              <nav className="level is-mobile">
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Events</p>
                    <p className="title">123</p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Orders</p>
                    <p className="title">3,456</p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Tickets</p>
                    <p className="title">5,639</p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Net value</p>
                    <p className="title">84,527 {item.defaultCurrency[0].symbol}</p>
                  </div>
                </div>
              </nav>
              Country: [<a href="#">{item.defaultCountry[0].display_name}]</a> - Languague: [<a href="#">{item.defaultLanguage[0].name}</a>] - Currency: [<a href="#">{item.defaultCurrency[0].symbol}</a>]
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">Groups</a>
            <a href="#" className="card-footer-item">Events</a>
            <a href="#" className="card-footer-item">Settings</a>
            <a href="#" className="card-footer-item">Delete</a>
          </footer>
        </div>

        ))}
      </div>
    </div>
  );
}
