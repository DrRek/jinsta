import store from '../core/store';
import logger from '../core/logging';
import { basicMediaInteraction } from '../features';
import { random } from '../core/utils';
import { HashtagFeed } from '../feeds';

/**
	Returns true if i've reached config limits.
*/
const checkLimits = (): boolean => {
	const { config, tagsToExplore } = store.getState();

	if (config.tags.length > 0) {
		if (tagsToExplore === undefined) {
			store.setState({ tagsToExplore: config.tags });
			return false;
		} else if (tagsToExplore.length > 0) {
			return false;
		}
	}
	logger.info('[HASHTAG FLOW] I\'ve reached config limits');
	return true;
};

/**
	Manage hastag flow of actions.
	Param `interactions`: number of actions to perform
	Returns true if no config limit has been reached.
*/
export default async (): boolean => {
	if (checkLimits()) return false;
	const { config, tagsToExplore } = store.getState();
	const randomTag = tagsToExplore[random(0, tagsToExplore.length)];
	const hashtagFeed = new HashtagFeed(randomTag);

	const basic = {
		tot: 0,
		current: 0,
		successful: 0,
		run: async () => {
			logger.info('\'ve chose to like');
			return true;
		}/*await basicMediaInteraction(
			hashtagFeed,
			config.basic_hashtag_interaction_comments_chance
		);*/
	};

	const follow = {
		tot: 0,
		current: 0,
		successful: null,
		run: async () => {
			logger.info('i\'ve chosed to follow');
			return true;
		}
	};


	basic.tot = random(
		1,
		Math.ceil(config.basic_hashtag_interaction_limit / tagsToExplore.length)
	);

	follow.tot = random(
		1,
		Math.ceil(config.follow_by_hashtag / tagsToExplore.length)
	);

	const tot = basic.tot + follow.tot;
	const actions = [basic, follow];
	for(let i = 0; i<tot; i++){
		const availableActions = actions.filter(({tot, current}) => current<tot);
		const randomAction = availableActions[random(0, availableActions.length)];
		const success = await randomAction.run();
		randomAction.current++;
		success && randomAction.successful++;
		logger.info('%o %o %o %o', basic, follow, actions, randomAction);
	}

	store.setState({
		tagsToExplore: tagsToExplore.filter(e => e !== randomTag)
	});

	return !checkLimits();
};
