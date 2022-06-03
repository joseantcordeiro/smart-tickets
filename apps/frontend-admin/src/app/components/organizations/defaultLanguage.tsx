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
import { useNavigate } from "react-router-dom";

const ValidatorSchema = Yup.object().shape({
	name: Yup.string()
		.min(8, 'Too Short!')
		.max(100, 'Too Long!')
		.required('Required'),
});

interface FormValues {
	name: string;
	defaultLanguage: string;
  defaultCountry: string;
  defaultCurrency: string;
}

const PARAMS_LIST = gql`
query Query {
  getLanguages {
    alpha_2
    name
  }
  getContries {
    iso_2
    display_name
  }
  getCurrencies {
    code
    name
  }
}
`;

const CREATE_ORGANIZATION = gql`
mutation CreateOrganization($name: String!, $defaultLanguage: String!, $defaultCountry: String!, $defaultCurrency: String!) {
  createOrganization(name: $name, defaultLanguage: $defaultLanguage, defaultCountry: $defaultCountry, defaultCurrency: $defaultCurrency) {
    id
    name
  }
}
`;

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(PARAMS_LIST);
  const [createOrganization] = useMutation(CREATE_ORGANIZATION, {
    onCompleted: () => {
      navigate('/organizations');
    }
  });

  if (loading) return (
    <progress className="progress is-large is-info" max="100">60%</progress>
  );
  if (error) return (
    <div className="notification is-danger">
      <button className="delete"></button>
        ${error.message}
    </div>
  );

  const initialValues: FormValues = { name: '', defaultLanguage: 'en', defaultCountry: 'us', defaultCurrency: 'usd' };

  return(
    <>
    <div className="box">
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/organizations" aria-current="page">Organizations</a></li>
          <li className="is-active"><a href="/organizations/create" aria-current="page">Create</a></li>
        </ul>
      </nav>
    </div>
    <div className="box">
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">
              Create Organization
            </p>
            <button className="card-header-icon" aria-label="more options">
              <span className="icon">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </header>
          <div className="card-content">
            <div className="content">
            <Formik
              initialValues={initialValues}
              validationSchema={ValidatorSchema}
              onSubmit={async (values, actions) => {
                console.log({ values, actions });
                createOrganization({ variables: {
                  "name": values.name,
                  "defaultLanguage": values.defaultLanguage,
                  "defaultCountry": values.defaultCountry,
                  "defaultCurrency": values.defaultCurrency,
                  }
                });

                alert('Organization created successfully!');
                actions.setSubmitting(false);
              }}
            >
            {({ errors, touched }) => (
              <Form>
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <div className="control">
                    <Field className="input" id="name" name="name" placeholder="Name" />
                    {errors.name && touched.name ? <div className="notification is-danger is-light"><button className="delete"></button>{errors.name}</div> : null}
                  </div>
                </div>
                <div className="field">
                  <label className="label">Default Language</label>
                  <div className="control">
                    <div className="select">
                      <Field as="select" name="defaultLanguage">
                        {data.getLanguages.map((language: { alpha_2: string; name: string; }) => (
                          <option value={language.alpha_2}>{language.name}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Default Country</label>
                  <div className="control">
                    <div className="select">
                      <Field as="select" name="defaultCountry">
                        {data.getCountries.map((country: { iso_2: string; display_name: string; }) => (
                          <option value={country.iso_2}>{country.display_name}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Default Currency</label>
                  <div className="control">
                    <div className="select">
                      <Field as="select" name="defaultCurrency">
                        {data.getCurrencies.map((currency: { code: string; name: string; }) => (
                          <option value={currency.code}>{currency.name}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>
                <button className="button is-primary" type="submit">Create</button>
              </Form>
              )}
            </Formik>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">Members</a>
            <a href="#" className="card-footer-item">Set Default</a>
            <a href="#" className="card-footer-item">Settings</a>
            <a href="#" className="card-footer-item">Delete</a>
          </footer>
        </div>
        </div>
    </div>
    </>
  );
}
