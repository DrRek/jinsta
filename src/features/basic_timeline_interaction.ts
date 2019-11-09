import { store } from '../core/store';
import { defaultMediaValidator } from './utils'
import { like, comment } from '../actions'
import { evaluateProbabilityInstance } from '../core/utils'
import { logger } from '../core/logger'

const isValidMedia = (media) =>
	defaultMediaValidator(media)

/**
feed: the object of the feed to take the next media from
*/
const basic_timeline_interaction = async (feed) => {
	const config = store.getState().config;

	do {
		const media = feed.getNextMedia();
	} while (!isValidMedia(media))

	const likeSuccess = await like(media)
	if(!likeSuccess){
		logger.error(
			'[BASIC_TIMELINE_INTERACTION] error while liking media')
		return
	}
	const shouldComment = likeSuccess && config.comments && evaluateProbabilityInstance(config.basic_timeline_interaction_comments_chance)

	if(shouldComment){
		const commentSuccess = await comment(media)
		if(!commentSuccess){
		logger.error(
			'[BASIC_TIMELINE_INTERACTION] error while commenting media') 
		}
		return
	}
}


export default basic_timeline_interaction