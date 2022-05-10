import { Component } from "react";
import { getMinioDomain } from "../../common/utils";

interface ProfilePictureProps {
  image: string
}

interface ProfilePictureState {
	picture: string
}

export default class ProfilePicture extends Component<ProfilePictureProps, ProfilePictureState> {
	constructor(props: ProfilePictureProps) {
    super(props)
    this.state = { picture: '' };
  }

	override render() {
		const image = getMinioDomain() + '/' + this.props.image;
		return (
			<div className="content has-text-centered">
				<figure className="image is-128x128">
					<img className="is-rounded" src={image} alt=""/>
				</figure>
				<p className="title is-4"></p>
				<div className="file">
					<label className="file-label">
						<input className="file-input" type="file" name="resume" />
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
}
