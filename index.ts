import {
	setup,
	Config,
	TimelineFeed,
	HashtagFeed,
	basic_interaction
} from './src';
import { random } from './src/core/utils';
import logger from './src/core/logging';
import { store, increment } from './src/core/store';

require('dotenv').config();

const getActions = (): string[] => {
	const {
		config,
		basic_timeline_interaction,
		basic_hashtag_interaction,
		tagsToExplore
	} = store.getState();
	const actions = [];

	if (
		config.basic_timeline_interaction_limit > 0 &&
		(!basic_timeline_interaction ||
			basic_timeline_interaction < config.basic_timeline_interaction_limit)
	)
		actions.push('timeline');

	if (config.tags.length > 0 && config.basic_hashtag_interaction_limit > 0) {
		if (tagsToExplore === undefined) {
			store.setState({ tagsToExplore: config.tags });
			actions.push('hashtags');
		} else if (
			tagsToExplore.length > 0 &&
			(!basic_hashtag_interaction ||
				basic_hashtag_interaction < config.basic_hashtag_interaction_limit)
		) {
			actions.push('hashtags');
		}
	}

	return actions;
};

async function main(): Promise<void> {
	const workspace = './workspace';

	const { IG_USERNAME, IG_PASSWORD } = process.env;
	const config = new Config(IG_USERNAME, IG_PASSWORD, workspace);

	config.comments = [
		'Bella pic :bowtie:',
		':fire: :fire: :fire:',
		'Grande ! :sunglasses:',
		'Top :raised_hands: :raised_hands:'
	];

	config.basic_timeline_interaction_limit = 0;

	config.basic_hashtag_interaction_limit = 3;
	config.basic_hashtag_interaction_comments_chance = 0;
	config.tags = [
		'pizza',
		'pizzaitaliana',
		'pizzanapoletana',
		'pizzanapoli',
		'pizzamargherita'
	];

	await setup(config);

	const timelineFeed = new TimelineFeed();

	//these will be the actual tags used in this session
	store.setState({ tagsToExplore: config.tags });

	let actions = [],
		interactions,
		successfulInteractions;
	while ((actions = getActions()).length > 0) {
		//choose a random action
		const currentAction = actions[random(0, actions.length)];

		switch (currentAction) {
			//Interactions picker for timeline feed
			case 'timeline':
				logger.info('[MAIN CONTROLLER] Starting timeline feature');
				interactions = random(
					1,
					Math.min(10, config.basic_timeline_interaction_limit)
				);
				successfulInteractions = 0;
				for (let i = 0; i < interactions; i++) {
					const interactionSuccess = await basic_interaction(
						timelineFeed,
						config.basic_timeline_interaction_comments_chance
					);
					interactionSuccess && successfulInteractions++;
				}
				increment('basic_timeline_interaction', successfulInteractions);

				break;

			//Interactions picker for hashtag feeds
			case 'hashtags':
				const { tagsToExplore } = store.getState();
				const randomTag = tagsToExplore[random(0, tagsToExplore.length)];

				interactions = random(
					1,
					Math.ceil(
						config.basic_hashtag_interaction_limit / tagsToExplore.length
					)
				);

				logger.info(
					'[MAIN CONTROLLER] Starting hashtag feature (tag: %s, interactions: %i)',
					randomTag,
					interactions
				);
				const hashtagFeed = new HashtagFeed(randomTag);

				successfulInteractions = 0;
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
				increment('basic_hashtag_interaction', successfulInteractions);
				break;

			default:
				logger.error(
					'[MAIN CONTROLLER] Erorr: unknown action - %s',
					currentAction
				);
				break;
		}
	}
	logger.info('[MAIN CONTROLLER] No actions left to do, terminating');
}

main();
