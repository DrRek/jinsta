import store from '../core/store';
import { defaultMediaValidator } from './utils';
import { like, comment } from '../actions';
import {
	boolFromProbability,
	convertIDtoPost,
	random,
	sleep
} from '../core/utils';
import logger from '../core/logging';

const isValidMedia = (media: any): boolean => defaultMediaValidator(media);

/**
feed: the object of the feed to take the next media from
*/
const basic_interaction = async (feed, commentProbability = 0): boolean => {
	const config = store.getState().config;

	let media;
	do {
		media = await feed.nextMedia();

		//sleep for 1 to 3 tenths of seconds
		await sleep(random(1, 3) / 10);
	} while (!isValidMedia(media));

	const likeSuccess = await like(media);
	if (!likeSuccess) {
		logger.error('[BASIC_TIMELINE_INTERACTION] error while liking media');
		return false;
	}
	const shouldComment =
		likeSuccess && config.comments && boolFromProbability(commentProbability);

	if (shouldComment) {
		const commentSuccess = await comment(media);
		if (!commentSuccess) {
			logger.error('[BASIC_TIMELINE_INTERACTION] error while commenting media');
			return false;
		}
	}

	logger.info(
		'[BASIC_TIMELINE_INTERACTION] interacted with %s',
		convertIDtoPost(media.id)
	);
	return true;
};

export default basic_interaction;
