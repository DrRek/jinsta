import { convertIDtoPost } from '../core/utils';
import { store } from '../core/store';
import logger from '../core/logging';

export default async (media: any): boolean => {
	const client = store.getState().client;
	const config = store.getState().config;

	let response: any = null;

	try {
		response = await client.media.comment({
			mediaId: media.id,
			text: config.chooseComment()
		});
	} catch (e) {
		if (e.message.includes('deleted')) {
			response.status = 'not okay';
			response.error = e;
		} else {
			throw e;
		} // throw the error
	}

	if (response.content_type !== 'comment' || response.status !== 'Active'){
		logger.error(
			'[COMMENT] unable to comment media: %o - response: %o',
			convertIDtoPost(media.id),
			response
		);
		return false;
	}

	return true;
};