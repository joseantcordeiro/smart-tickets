export default function Organizations() {

  return(
    <div>
      <div className="box">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a href="/">Home</a></li>
            <li className="is-active"><a href="/organizations" aria-current="page">Organizations</a></li>
          </ul>
        </nav>
      </div>
      <div className="container">
        <h1 className="title">
          Organizations
        </h1>
        <p className="subtitle">
          Organizations with <strong>Bulma</strong>!
        </p>
      </div>
    </div>
  );
}
