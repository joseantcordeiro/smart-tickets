import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { signOut } from "supertokens-auth-react/recipe/emailpassword";
import AccountDropDown from "./account";
import { useNavigate, Link } from "react-router-dom";

export default function Nav() {
  const {accessTokenPayload} = useSessionContext();

  const navigate = useNavigate();
	async function logoutClicked() {
    await signOut();
    navigate('/auth');
  }

  return(
    <nav className="navbar is-black" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbar" className="navbar-menu">
        <div className="navbar-start">
          <Link className="navbar-item" to="/">
          <span className="icon">
              <i className="fa fa-home"></i>
            </span>
          </Link>

          <Link className="navbar-item" to="/dashboard">
            Dashboard
          </Link>

          <Link className="navbar-item" to="/organizations">
            Organizations
          </Link>

          <Link className="navbar-item" to="/teams">
            Teams
          </Link>

          <Link className="navbar-item" to="/channels">
            Channels
          </Link>

          <Link className="navbar-item" to="/groups">
            Groups
          </Link>

          <Link className="navbar-item" to="/events">
            Events
          </Link>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <span className="icon">
              <i className="fa-brands fa-github"></i>
            </span>
            <span className="icon">
              <i className="fa-brands fa-twitter"></i>
            </span>
            <span className="icon">
              <i className="fas fa-life-ring"></i>
            </span>
            <AccountDropDown logoutClicked={logoutClicked} picture={accessTokenPayload.picture} />
          </div>
        </div>
      </div>
    </nav>

  );
}
