import store from '../core/store';
import logger from '../core/logging';
import { basicMediaInteraction } from '../features';
import { random } from '../core/utils';
import { HashtagFeed } from '../feeds';

/**
	Returns true if i've reached config limits.
*/
const checkLimits = (): boolean => {
	const { config, basic_hashtag_interaction } = store.getState();

	if (
		config.basic_hashtag_interaction_limit > 0 &&
		(!basic_hashtag_interaction ||
			basic_hashtag_interaction < config.basic_hashtag_interaction_limit)
	) {
		return false;
	}
	logger.info('[HASHTAG MEDIA INTERACTION] I\'ve reached config limits');
	return true;
};

/**
	Manage hastag flow of actions.
	Param `interactions`: number of actions to perform
	Returns true if no config limit has been reached.
*/
const hashtagMediaInteraction = async (feed, interactions): boolean => {
	if (checkLimits()) return false;
	const { config } = store.getState();

	let successfulInteractions = 0;
	for (let i = 0; i < interactions; i++) {
		const interactionSuccess = await basicMediaInteraction(
			hashtagFeed,
			config.basic_hashtag_interaction_comments_chance
		);
		interactionSuccess && successfulInteractions++;
	}

	store.change(({ basic_hashtag_interaction }) => ({
		basic_hashtag_interaction: basic_hashtag_interaction
			? basic_hashtag_interaction + successfulInteractions
			: successfulInteractions
	}));

	return !checkLimits();
};

export default hashtagMediaInteraction;
