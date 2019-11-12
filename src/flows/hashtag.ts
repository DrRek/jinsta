import store from '../core/store';
import logger from '../core/logging';
import { basicMediaInteraction, hashtagFollow } from '../features';
import { random } from '../core/utils';
import { HashtagFeed } from '../feeds';
import { saveManyFollow } from '../core/database';

const NAMESPACE = 'HASHTAG FLOW';

/**
	Returns true if i've reached config limits.
*/
const checkLimits = (): boolean => {
	const {
		config: { tags },
		tagsToExplore
	} = store.getState();

	if (tags.length > 0) {
		if (tagsToExplore === undefined) {
			store.setState({ tagsToExplore: tags });
			return false;
		} else if (tagsToExplore.length > 0) {
			return false;
		}
	}
	logger.info(`[${NAMESPACE}] I've reached config limits`);
	return true;
};

/**
	Manage hashtag flow of actions.
	Param `interactions`: number of actions to perform
	Returns true if no config limit has been reached.
*/
export default async (): boolean => {
	if (checkLimits()) return false;
	logger.info(`[${NAMESPACE}] starting`);
	const { config, tagsToExplore } = store.getState();
	const randomTag = tagsToExplore[random(0, tagsToExplore.length)];
	const hashtagFeed = new HashtagFeed(randomTag);

	const followed = [];

	const basic = {
		tot: random(
			1,
			Math.ceil(config.basic_hashtag_interaction_limit / tagsToExplore.length)
		),
		current: 0,
		successful: 0,
		run: async (): boolean =>
			await basicMediaInteraction(
				hashtagFeed,
				config.basic_hashtag_interaction_comments_chance
			)
	};

	const follow = {
		tot: random(1, Math.ceil(config.follow_by_hashtag / tagsToExplore.length)),
		current: 0,
		successful: null,
		run: async (): any => {
			const res = await hashtagFollow(hashtagFeed);
			res && followed.push(res);
			return res;
		}
	};

	const tot = basic.tot + follow.tot;
	const actions = [basic, follow];
	for (let i = 0; i < tot; i++) {
		const availableActions = actions.filter(
			({ tot, current }) => current < tot
		);
		const randomAction = availableActions[random(0, availableActions.length)];
		const success = await randomAction.run();
		randomAction.current++;
		success && randomAction.successful++;
	}

	if (followed && followed.length > 0) saveManyFollow(followed);

	store.setState({
		tagsToExplore: tagsToExplore.filter(e => e !== randomTag)
	});

	return !checkLimits();
};
