import { like, follow } from '../actions';
import {
	boolFromProbability,
	convertIDtoPost,
	convertUserToUrl,
	random,
	sleep
} from '../core/utils';
import logger from '../core/logging';
import { UserFeed } from '../feeds';
import { storyView } from '.';

/**
feed: the object of the feed to take the next media from
*/
const basicFollow = async (user: any): any => {
	const NAMESPACE = 'BASIC FOLLOW';

	storyView(user.pk);

	const numberOfLikes = random(1, 3);
	const targetUserFeed = new UserFeed(user.pk);
	let liked = 0, userFeedMedia;

	while (
		(userFeedMedia = await targetUserFeed.nextMedia()) != null &&
		liked < numberOfLikes
	) {
		if ( boolFromProbability(0.3) && await like(userFeedMedia)) {
			liked++;
			logger.info(
				`[${NAMESPACE}] %i/%i post ( %s ) liked for user %s %s`,
				liked,
				numberOfLikes,
				convertIDtoPost(userFeedMedia.id),
				convertUserToUrl(user.username),
				user.pk
			);
		}
		await sleep(random(1, 3));
	}

	if (liked < numberOfLikes) {
		logger.warn(
			`[${NAMESPACE}] unable to properly interact with user %s %s, will not follow.`,
			convertUserToUrl(user.username),
			user.pk
		);
		return null;
	}

	await sleep(random(3, 5));
	if (follow(user.pk)) {
		logger.info(
			`[${NAMESPACE}] followed: %s %s.`,
			convertUserToUrl(user.username),
			user.pk
		);
		return { pk: user.pk, timestamp: new Date() };
	} else {
		logger.warn(
			`[${NAMESPACE}] unable to follow user: %s %s`,
			convertUserToUrl(user.username),
			user.pk
		);
		return null;
	}
};

export default basicFollow;
