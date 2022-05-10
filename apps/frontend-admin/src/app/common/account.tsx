import { getMinioDomain } from "../app";

interface IProps {
	logoutClicked: any;
	picture: string;
}

export default function AccountDropDown(props: IProps) {
	const logoutClicked = props.logoutClicked;
	const image = getMinioDomain() + '/' + props.picture;

	const state = {
		items: [
			{ name: "Profile", id: "profile", active: "navbar-item", href: "/account/profile"},
			{ name: "Settings", id: "settings", active: "navbar-item", href: "/account/settings"},
		]
	}

  return (
  <div className="navbar-item has-dropdown is-hoverable">
    <a className="navbar-link">
      <figure className="image is-24x24">
        <img className="is-rounded" src={image} alt=""/>
      </figure>
    </a>

    <div className="navbar-dropdown">
    {state.items.map(item => (
      <a className={item.active} id={item.id} href={item.href}>
        {item.name}
      </a>
    ))}
      <hr className="navbar-divider" />
      <a className="navbar-item" onClick={logoutClicked}>
        Logout
      </a>
    </div>
  </div>
  )

}
