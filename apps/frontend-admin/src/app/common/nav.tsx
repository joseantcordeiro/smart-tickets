import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { signOut } from "supertokens-auth-react/recipe/emailpassword";
import AccountDropDown from "./account"
import { navigate } from 'hookrouter';

export default function Nav() {
  const {userId, accessTokenPayload} = useSessionContext();

	async function logoutClicked() {
    await signOut();
    navigate('/auth');
    window.location.reload();
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
          <a className="navbar-item" href="/">
          <span className="icon">
              <i className="fa fa-home"></i>
            </span>
          <span>{accessTokenPayload.name}</span>
          </a>

          <a className="navbar-item" href="/">
            Dashboard
          </a>

          <a className="navbar-item" href="/organizations">
            Organizations
          </a>

          <a className="navbar-item" href="/teams">
            Teams
          </a>
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
