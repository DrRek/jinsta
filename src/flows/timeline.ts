import { store, increment } from "../core/store";
import logger from "../core/logging";
import basic_interaction from "../features";

/**
	Returns true if i've reached config limits.
*/
const checkLimits = (): boolean => {
	const { config, basic_timeline_interaction } = store.getState();

	if (config.basic_timeline_interaction_limit > 0) {
		if (
			!basic_timeline_interaction ||
			basic_timeline_interaction < config.basic_timeline_interaction_limit
		)
			return false;
	}
	logger.info("[TIMELINE FLOW] I've reached config limits");
	return true;
};

/**
	Manage timeline flow of actions.
	Param `interactions`: number of actions to perform
	Returns true if no config limit has been reached.
*/
export default async (interactions: number): boolean => {
	if (checkLimits()) return false;
	const { config } = store.getState();
	let successfulInteractions = 0;
	for (let i = 0; i < interactions; i++) {
		const interactionSuccess = await basic_interaction(
			timelineFeed,
			config.basic_timeline_interaction_comments_chance
		);
		interactionSuccess && successfulInteractions++;
	}
	increment("basic_timeline_interaction", successfulInteractions);

	return !checkLimits();
};
