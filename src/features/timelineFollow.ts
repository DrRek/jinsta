import store from '../core/store';
import { defaultMediaValidator } from './utils';
import { random, sleep } from '../core/utils';
import basicFollow from './basicFollow';
import { UserFeed, CommentsFeed } from '../feeds';
import logger from '../core/logging';

const NAMESPACE = 'TIMELINE FLOW';

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
const timelineFollow = async (feed): any => {
	const { client } = store.getState();

	let media, user;
	do {
		media = await feed.nextMedia();
		if (!media) return null;
		const targetUserPk = media.user.pk;
		user = await client.user.info(targetUserPk);

		//sleep for 1 to 3 tenths of seconds
		await sleep(random(1, 3) / 1); //TODO DA SISTEMAREEEEEEEEEEEEEEEEEEEE A 10
	} while (!isValidMedia(media) || !isValidUser(user));

	const userFeed = new UserFeed(user.pk);
	let comment = null;
	do {
		//sleep for 1 to 3 tenths of seconds
		await sleep(random(1, 3) / 1); //TODO DA SISTEMAREEEEEEEEEEEEEEEEEEEE A 10

		logger.info(`[${NAMESPACE}] testing new media found`);
		media = await userFeed.nextMedia();
		if (!media) return null;

		logger.info(`[${NAMESPACE}] testing new comments`);
		const commentFeed = new CommentsFeed(media.id);
		do {
			await sleep(random(1, 3) / 10); //TODO DA SISTEMAREEEEEEEEEEEEEEEEEEEE A 10
			comment = await commentFeed.nextMedia();
			//logger.info(`[${NAMESPACE}] tesgtin comment %o`, comment);
		} while(comment && comment.child_comment_count < 1);

	} while (!comment);

	const friendUser = await client.user.info(comment.user.pk);
	return await basicFollow(friendUser);
};

export default timelineFollow;
