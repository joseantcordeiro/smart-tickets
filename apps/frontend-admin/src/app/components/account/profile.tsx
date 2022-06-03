import { gql, useQuery } from "@apollo/client";
import {
	Formik,
	Form,
	Field,
} from 'formik';
import * as Yup from 'yup';
import ProfilePicture from "./picture";

const ValidatorSchema = Yup.object().shape({
	name: Yup.string()
		.min(8, 'Too Short!')
		.max(100, 'Too Long!')
		.required('Required'),
});

interface FormValues {
	name: string;
	defaultLanguage: string;
}

const ME = gql`
query Me {
  me {
    id
    name
    email
    picture
    language
  }
  getLanguages {
    alpha_2
    name
  }
}
`;

export default function Profile() {
  const { loading, error, data } = useQuery(ME);

  if (loading) return (
    <progress className="progress is-large is-info" max="100">60%</progress>
  );
  if (error) return (
    <div className="notification is-danger">
      <button className="delete"></button>
        ${error.message}
    </div>
  );

  const initialValues: FormValues = { name: data.me.name, defaultLanguage: data.me.language };

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-one-quarter">
          <div className="box">
            <ProfilePicture image={data.me.picture} />
          </div>
        </div>
        <div className="column">
        <div className="box">
        <Formik
        initialValues={initialValues}
        validationSchema={ValidatorSchema}
        onSubmit={async (values, actions) => {
          console.log({ values, actions });

          alert('Profile updated!');
          actions.setSubmitting(false);
        }}
      >
      {({ errors, touched }) => (
        <Form>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <div className="control">
              <Field className="input" id="name" name="name" placeholder="Full Name" />
              {errors.name && touched.name ? <div className="notification is-danger is-light"><button className="delete"></button>{errors.name}</div> : null}
            </div>
          </div>
          <div className="field">
            <label className="label">Default Language</label>
            <div className="control">
              <div className="select">
                <Field as="select" name="defaultLanguage">
                  {data.getLanguages.map((item: { alpha_2: string; name: string; }) => (
                    <option value={item.alpha_2}>{item.name}</option>
                  ))}
                </Field>
              </div>
            </div>
          </div>
          <button className="button is-primary" type="submit">Update Profile</button>
        </Form>
        )}
        </Formik>
        </div>
        </div>
      </div>
    </div>
  );
}
