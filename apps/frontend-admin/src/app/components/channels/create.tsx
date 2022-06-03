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
  organizationId: string
	name: string;
	description: string;
}

const ORGANIZATIONS_LIST = gql`
query Organizations {
  organizations {
    id
    name
  }
}
`;

const CREATE_CHANNEL = gql`
mutation CreateChannel($organizationId: String!, $name: String!, $description: String) {
  createChannel(organizationId: $organizationId, name: $name, description: $description) {
    id
    name
    description
  }
}
`;

export default function CreateChannel() {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(ORGANIZATIONS_LIST);
  const [createChannel] = useMutation(CREATE_CHANNEL, {
    onCompleted: () => {
      navigate('/channels');
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

  const initialValues: FormValues = { organizationId: '', name: '', description: '' };

  return(
    <>
    <div className="box">
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/channels" aria-current="page">Channels</a></li>
          <li className="is-active"><a href="/channels/create" aria-current="page">Create</a></li>
        </ul>
      </nav>
    </div>
    <div className="box">
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">
              Create Channel
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
                createChannel({ variables: {
                  "organizationId": values.organizationId,
                  "name": values.name,
                  "description": values.description,
                  }
                });

                alert('Organization created successfully!');
                actions.setSubmitting(false);
              }}
            >
            {({ errors, touched }) => (
              <Form>
                <div className="field">
                  <label className="label">Organization</label>
                  <div className="control">
                    <div className="select">
                      <Field as="select" name="organizationId" id="organizationId">
                        {data.organizations.map((item: { id: string; name: string; }) => (
                          <option value={item.id}>{item.name}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <div className="control">
                    <Field className="input" id="name" name="name" placeholder="Name" />
                    {errors.name && touched.name ? <div className="notification is-danger is-light"><button className="delete"></button>{errors.name}</div> : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="description">Description</label>
                  <div className="control">
                    <Field className="input" id="description" name="description" placeholder="Description" />
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
