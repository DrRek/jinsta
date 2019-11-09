import store from '../core/store';
import logger from '../core/logging';
import { basic_interaction } from '../features';
import { random } from '../core/utils';
import { HashtagFeed } from '../feeds';

/**
	Returns true if i've reached config limits.
*/
const checkLimits = (): boolean => {
	const { config, basic_hashtag_interaction, tagsToExplore } = store.getState();

	if (config.tags.length > 0 && config.basic_hashtag_interaction_limit > 0) {
		if (tagsToExplore === undefined) {
			store.setState({ tagsToExplore: config.tags });
			return false;
		} else if (
			tagsToExplore.length > 0 &&
			(!basic_hashtag_interaction ||
				basic_hashtag_interaction < config.basic_hashtag_interaction_limit)
		) {
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

	const interactions = random(
		1,
		Math.ceil(config.basic_hashtag_interaction_limit / tagsToExplore.length)
	);

	logger.info(
		'[HASHTAG FLOW] tag: %s, interactions: %i',
		randomTag,
		interactions
	);
	const hashtagFeed = new HashtagFeed(randomTag);

	let successfulInteractions = 0;
	for (let i = 0; i < interactions; i++) {
		const interactionSuccess = await basic_interaction(
			hashtagFeed,
			config.basic_hashtag_interaction_comments_chance
		);
		interactionSuccess && successfulInteractions++;
	}

	store.setState({
		tagsToExplore: tagsToExplore.filter(e => e !== randomTag)
	});

	store.change( ({basic_hashtag_interaction}) => ({
		basic_hashtag_interaction: basic_hashtag_interaction ? basic_hashtag_interaction + successfulInteractions : successfulInteractions
	}));

	return !checkLimits();
};
