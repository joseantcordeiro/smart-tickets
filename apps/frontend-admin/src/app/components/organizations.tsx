import {
  useQuery,
  gql,
  useMutation,
} from '@apollo/client';
import {
	Formik,
	Form,
	Field,
} from 'formik';
import * as Yup from 'yup';

const ValidatorSchema = Yup.object().shape({
	name: Yup.string()
		.min(8, 'Too Short!')
		.max(100, 'Too Long!')
		.required('Required'),
});

const ORGANIZATIONS_LIST = gql`
query Organizations {
  organizations {
    id
    name
    owner {
      id
      name
      picture
    }
    workers {
      id
      name
      picture
    }
    defaultLanguage {
      name
    }
    defaultCountry {
      display_name
    }
    defaultCurrency {
      symbol
    }
  }
}
`;

const SET_DEFAULT_ORGANIZATION = gql`
mutation SetDefaultOrganization($organizationId: String!) {
  setDefaultOrganization(organizationId: $organizationId) {
    key
    value
  }
}
`;

const UPDATE_ORGANIZATION = gql`
mutation UpdateOrganizations($update: OrganizationUpdateInput, $where: OrganizationWhere) {
  updateOrganizations(update: $update, where: $where) {
    organizations {
      id
      name
    }
  }
}
`;

export default function Organizations() {
  const { loading, error, data } = useQuery(ORGANIZATIONS_LIST);
  const [setDefaultOrganization] = useMutation(SET_DEFAULT_ORGANIZATION, {
    onCompleted: () => {
      window.location.reload();
    }
  });
  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION, {})

  if (loading) return (
    <progress className="progress is-large is-info" max="100">60%</progress>
  );
  if (error) return (
    <div className="notification is-danger">
      <button className="delete"></button>
        ${error.message}
    </div>
  );

  async function onClick(organizationId: string) {
    setDefaultOrganization({ variables: { organizationId } });
  }

  return(
    <>
    <div id="modal-js-create-organization" className="modal">
      <div className="modal-background"></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Create Organization</p>
          <button className="modal-close is-large" aria-label="close"></button>
        </header>
        <section className="modal-card-body">
          -- Content ...
        </section>
        <footer className="modal-card-foot">
          <button className="button is-success">Save</button>
          <button className="button">Cancel</button>
        </footer>
      </div>
    </div>
    <div className="box">
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><a href="/">Home</a></li>
          <li className="is-active"><a href="/organizations" aria-current="page">Organizations</a></li>
          <li><a className="button is-small" href="/organizations/create">Create Organization</a></li>
        </ul>
      </nav>
    </div>
    <div className="box">
        {data.organizations.map((item: { id: string; name: string; defaultCurrency: [{ symbol: string}]; defaultCountry: [{ display_name: string}]; defaultLanguage: [{ name: string}] }) => (
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">
            <Formik
              initialValues={{name: item.name}}
              validationSchema={ValidatorSchema}
              onSubmit={async (values, actions) => {
                console.log({ values, actions });
                updateOrganization({ variables: {
                  "update": {
                    "name": values.name
                  },
                  "where": {
                    "id": item.id
                  }
                }});

                alert('Name updated!');
                actions.setSubmitting(false);
              }}
            >
            {({ errors, touched }) => (
              <Form>
                <div className="field">
                  <div className="control">
                    <table className="table">
                      <tbody>
                        <tr>
                          <td>
                    <Field className="input" id="name" name="name" placeholder="Organization Name" />
                    {errors.name && touched.name ? <div className="notification is-danger is-light"><button className="delete"></button>{errors.name}</div> : null}
                          </td>
                          <td>
                    <button className="button is-success" type="submit">
                      <span className="icon is-small">
                        <i className="fas fa-check"></i>
                      </span>
                      <span>Save</span>
                    </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Form>
              )}
              </Formik>
            </p>
            <button className="card-header-icon" aria-label="more options">
              <span className="icon">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </header>
          <div className="card-content">
            <div className="content">
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
            <a href="#" className="card-footer-item">Members</a>
            <a href="#" className="card-footer-item" onClick={() => onClick(item.id)}>Set Default</a>
            <a href="#" className="card-footer-item">Settings</a>
            <a href="#" className="card-footer-item">Delete</a>
          </footer>
        </div>

        ))}
    </div></>
  );
}
