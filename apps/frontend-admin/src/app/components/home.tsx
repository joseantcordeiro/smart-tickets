export default function Home() {

  return(
    <div>
      <div className="box">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a href="/">Home</a></li>
            <li className="is-active"><a href="/teams" aria-current="page">Teams</a></li>
          </ul>
        </nav>
      </div>
      <div className="container is-fluid">
        <h1 className="title">
          Home
        </h1>
        <p className="subtitle">
          Home with <strong>Bulma</strong>!
        </p>
      </div>
    </div>
  );
}
