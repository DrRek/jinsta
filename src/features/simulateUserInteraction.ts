import store from '../core/store';
import { storyMassView, storyView } from './story';
import { TimelineFeed, UserFeed, CommentsFeed } from '../feeds';
import { random, sleep } from '../core/utils';
import logger from '../core/logging';

const NAMESPACE = 'SIMULATE USER INTERACTION';

const pickMedia = async (feed: any): any => {
	let media = null;
	for (let i = random(3, 30); i > 0; i--) {
		await sleep(random(0, 1));
		media = await feed.nextMedia();
	}
	return media;
};

const pickUser = async (media: any, client: any): any => {
	const userPk = media.user.pk;
	await storyView([userPk]);

	await sleep(random(1, 2));
	return await client.user.info(userPk);
};

const randomFeedFromMedia = async (media: any): any => {
	const commentFeed = new CommentsFeed(media.id);
	const commentsIterator = random(1, 5);
	let comment = null;
	for (let i = 0; i < commentsIterator; i++) {
		await sleep(random(0, 1));
		const tempComment = await commentFeed.nextMedia();
		if (tempComment) comment = tempComment;
	}
	return comment && new UserFeed(comment.user.pk);
};

const randomFeed = async (feeds, medias, users): any => {
	const sourceIndex = random(0, 3);

	if (sourceIndex === 0) {
		if (feeds && feeds.length > 0) {
			return feeds[random(0, feeds.length)];
		}
	}
	if (sourceIndex === 1) {
		if (users && users.length > 0) {
			const randomUser = users[random(0, users.length)];
			return new UserFeed(randomUser.pk);
		}
	}
	if (medias && medias.length > 0) {
		const randomMedia = medias[random(0, medias.length)];
		return await randomFeedFromMedia(randomMedia);
	}
	logger.error(
		`[${NAMESPACE}] randomFeed did not return any valid feed. sourceIndex: %i`,
		sourceIndex
	);
	return null;
};

export default async (): void => {
	const { client } = store.getState();

	await storyMassView();

	const timelineFeed = new TimelineFeed();

	const maxActions = random(10, 15);

	let currentFeed = null;
	for (let i = 0; i < maxActions; i++) {
		if (!currentFeed) currentFeed = timelineFeed;
		logger.info(`[${NAMESPACE}] picking media %i/%i`, i, maxActions);
		const media = await pickMedia(currentFeed);

		if (!media) {
			currentFeed = timelineFeed;
			continue;
		}
		logger.info(`[${NAMESPACE}] picking user %i/%i`, i, maxActions);
		const user = await pickUser(media, client);
		logger.info(`[${NAMESPACE}] choosing new feed %i/%i`, i, maxActions);

		currentFeed = await randomFeed([timelineFeed], [media], [user]);
	}
};
