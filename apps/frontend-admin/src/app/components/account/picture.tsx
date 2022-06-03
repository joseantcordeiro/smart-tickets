import { gql, useMutation } from "@apollo/client";
import { getMinioDomain } from "../../common/utils";

interface ProfilePictureProps {
  image: string
}

interface ProfilePictureState {
	picture: string
}

const UPLOAD_FILE = gql`
mutation FileUpload($file: Upload!) {
  fileUpload(file: $file) {
    pictureUrl
  }
}
`;

export default function ProfilePicture(props: ProfilePictureProps) {
  let image = getMinioDomain() + '/' + props.image;
  const [fileUpload] = useMutation(UPLOAD_FILE, {
    onCompleted: (data) => {
      console.log(data);
      image = getMinioDomain() + '/' + data.fileUpload.pictureUrl;
    }
  });

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    fileUpload({ variables: { file: file } });
  };

	return (
			<div className="content has-text-centered">
				<figure className="image is-128x128">
					<img className="is-rounded" src={image} alt=""/>
				</figure>
				<p className="title is-4"></p>
				<div className="file">
					<label className="file-label">
						<input className="file-input" type="file" name="resume" onChange={handleFileChange} />
							<span className="file-cta">
								<span className="file-icon">
									<i className="fas fa-upload"></i>
								</span>
								<span className="file-label">
									Choose a file…
								</span>
							</span>
					</label>
				</div>
			</div>
	)
}
