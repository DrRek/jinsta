import { chance, convertIDtoPost } from '../core/utils';
import { store } from '../core/store';
import logger from '../core/logging';

export default async (media: any): boolean => {
	const client = store.getState().client;
	const config = store.getState().config;
	const { user } = config;

	let response: any = null;

	try {
		response = await client.media.like({
			mediaId: media.id,
			moduleInfo: {
				module_name: 'profile',
				user_id: user.pk,
				username: user.username
			},
			// d means like by double tap (1), you cant unlike posts with double tap
			d: chance(0.5) ? 0 : 1
		});
	} catch (e) {
		if (e.message.includes('deleted')) {
			response.status = 'not okay';
			response.error = e;
		} else {
			throw e;
		} // throw the error
	}

	if (response.status !== 'ok'){
		logger.error(
			'[LIKE] unable to like media: %o - response: %o',
			convertIDtoPost(media.id),
			response
		);
	}

	return true;
};