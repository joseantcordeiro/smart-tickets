let wIsNode = true;
try {
	wIsNode = window === undefined;
// eslint-disable-next-line no-empty
} catch (e) {
}

export default wIsNode;
