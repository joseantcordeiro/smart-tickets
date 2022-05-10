import { gql, useQuery } from "@apollo/client";
import { Field } from 'formik';

const GET_LANGUAGES = gql`
query GetLanguages {
  getLanguages {
    alpha_2
    name
  }
}
`;

export default function Languages() {
  const { loading, error, data } = useQuery(GET_LANGUAGES);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
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
  );
}
