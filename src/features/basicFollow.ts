import store from '../core/store';
import { defaultMediaValidator } from './utils';
import { like, follow } from '../actions';
import {
	boolFromProbability,
	convertIDtoPost,
	random,
	sleep
} from '../core/utils';
import logger from '../core/logging';
import { UserFeed } from '../feeds';
import { storyView } from '.';

const isValidMedia = (media: any): boolean => defaultMediaValidator(media);

const isValidUser = ({
	profile_pic_id,
	following_count,
	follower_count
}: any): boolean => {
	return profile_pic_id && follower_count > 20 && following_count < 1000;
};

/**
feed: the object of the feed to take the next media from
*/
const basicFollow = async (feed): any => {
	const NAMESPACE = 'BASIC FOLLOW';
	const { client } = store.getState();

	let media, user;
	do {
		media = await feed.nextMedia();
		const targetUserPk = media.user.pk;
		user = await client.user.info(targetUserPk);

		//sleep for 1 to 3 tenths of seconds
		await sleep(random(1, 3) / 1); //TODO DA SISTEMAREEEEEEEEEEEEEEEEEEEE A 10
	} while (!isValidMedia(media) || !isValidUser(user));

	storyView(user.pk);

	const numberOfLikes = random(1, 3);
	const targetUserFeed = new UserFeed(user.pk);
	let liked = 0, currentMedia;

	while (
		(currentMedia = await targetUserFeed.nextMedia()) != null &&
		liked < numberOfLikes
	) {
		if ( boolFromProbability(0.3) && await like(currentMedia)) {
			logger.info(
				`[${NAMESPACE}] %i/%i post (%s) liked for user https://www.instagram.com/%s`,
				liked,
				numberOfLikes,
				convertIDtoPost(media.id),
				user.username
			);
			liked++;
		}
		await sleep(random(1, 3));
	}

	if (liked < numberOfLikes) {
		logger.warn(
			`[${NAMESPACE}] unable to properly interact with user https://www.instagram.com/%s/, will not follow.`,
			user.username
		);
		return null;
	}

	await sleep(random(3, 5));
	if (follow(user.pk)) {
		logger.info(
			`[${NAMESPACE}] followed: https://www.instagram.com/%s/.`,
			user.username
		);
		return { pk: user.pk, timestamp: new Date() };
	} else {
		logger.warn(
			`[${NAMESPACE}] unable to follow user: https://www.instagram.com/%s/`,
			user.username
		);
		return null;
	}
};

export default basicFollow;
