import { store, increment } from '../core/store';
import { defaultMediaValidator } from './utils';
import { like, comment } from '../actions';
import { boolFromProbability, convertIDtoPost } from '../core/utils';
import logger from '../core/logging';

const isValidMedia = (media) =>
	defaultMediaValidator(media);

/**
feed: the object of the feed to take the next media from
*/
const basic_timeline_interaction = async (feed) => {
	const config = store.getState().config;

	let media;
	do {
		media = await feed.nextMedia();
	} while (!isValidMedia(media));

	const likeSuccess = await like(media);
	if(!likeSuccess){
		logger.error(
			'[BASIC_TIMELINE_INTERACTION] error while liking media');
		return;
	}
	const shouldComment = likeSuccess && config.comments && boolFromProbability(config.basic_timeline_interaction_comments_chance);

	if(shouldComment){
		const commentSuccess = await comment(media);
		if(!commentSuccess){
			logger.error(
				'[BASIC_TIMELINE_INTERACTION] error while commenting media'); 
		}
		return;
	}

	increment('basic_timeline_interaction_limit');

	logger.info('[BASIC_TIMELINE_INTERACTION] interacted with %s', convertIDtoPost(media.id));
};


export default basic_timeline_interaction;