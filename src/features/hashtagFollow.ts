import store from '../core/store';
import { defaultMediaValidator } from './utils';
import {
	random,
	sleep
} from '../core/utils';
import basicFollow from './basicFollow';

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
const hashtagFollow = async (feed): any => {
	const { client } = store.getState();

	let media, user;
	do {
		media = await feed.nextMedia();
		const targetUserPk = media.user.pk;
		user = await client.user.info(targetUserPk);

		//sleep for 1 to 3 tenths of seconds
		await sleep(random(1, 3) / 1); //TODO DA SISTEMAREEEEEEEEEEEEEEEEEEEE A 10
	} while (!isValidMedia(media) || !isValidUser(user));

	return await basicFollow(user);
};

export default hashtagFollow;
