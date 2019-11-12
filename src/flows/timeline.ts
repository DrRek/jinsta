import store from '../core/store';
import logger from '../core/logging';
import { basicMediaInteraction, timelineFollow } from '../features';
import { random } from '../core/utils';
import { saveManyFollow } from '../core/database';

const NAMESPACE = 'TIMELINE FLOW';

/**
	Returns true if i've reached config limits.
*/
const checkLimits = (): boolean => {
	const {
		config: {
			basic_timeline_interaction_limit: configInt,
			follow_by_timeline: configFollow
		},
		basic_timeline_interaction: currentInt,
		follow_by_timeline: currentFollow
	} = store.getState();

	if (
		(configInt > 0 && (!currentInt || currentInt < configInt)) ||
		(configFollow > 0 && (!currentFollow || currentFollow < configFollow))
	) {
		return false;
	}
	logger.info(`[${NAMESPACE}] I've reached config limits`);
	return true;
};

/**
	Manage timeline flow of actions.
	Param `interactions`: number of actions to perform
	Returns true if no config limit has been reached.
*/
export default async (timelineFeed, interactions: number): boolean => {
	if (checkLimits()) return false;
	logger.info(`[${NAMESPACE}] starting`);
	const { config } = store.getState();

	const followed = [];

	const basic = {
		tot: interactions,
		current: 0,
		successful: 0,
		run: async (): boolean => {
			const res = await basicMediaInteraction(
				timelineFeed,
				config.basic_timeline_interaction_comments_chance
			);
			
			return res;
		}
	};

	const follow = {
		tot: random(1, config.follow_by_timeline),
		current: 0,
		successful: null,
		run: async (): any => {
			const res = await timelineFollow(timelineFeed);
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

	store.change(({ basic_timeline_interaction: bti, follow_by_timeline: fbt }) => ({
		basic_timeline_interaction: bti
			? bti + basic.successful
			: basic.successful,
		follow_by_timeline: fbt
			? fbt + follow.successful
			: follow.successful
	}));

	return !checkLimits();
};
