import {
	setup,
	Config,
	TimelineFeed,
	HashtagFeed
} from "./src";
import { random } from "./src/core/utils";
import logger from "./src/core/logging";
import store from "./src/core/store";
import { timeline, hashtag } from "./src/flows";
import { storyMassView, simulateUserInteraction } from "./src/features";
import { follow, unfollow } from './src/actions'

require("dotenv").config();

async function main(): Promise<void> {
	const workspace = "./workspace";

	const { IG_USERNAME, IG_PASSWORD } = process.env;
	const config = new Config(IG_USERNAME, IG_PASSWORD, workspace);

	config.comments = [
		"Bella foto! 😍 😋 🍕",
		"Ottima pizza! 😍 😋 🍕",
		"Ben fatto! 😁 👏 🍕",
		"Sembra davvero buona! 😋 😍  🍕",
		"Continua così!! 👏 👏  🍕",
		"Calda calda è ancora più buona! 😍 😋 🍕",
		"Speciale! 😍 😋 🍕",
		"Che capolavoro! 😍 👏 🍕",
		"È davvero uno spettacolo! 😍 👏 🍕",
		"Buonissima! 👏 👏 🍕",
		"Come se ne può fare a meno?! 😋 😋 🍕",
		"Strepitosa! 😍 😋 🍕",
		"Ma è bellissima! 😍 😋 🍕",
		"La mangerei tutti giorni! 😋 🍕",
		"Posso averne una fetta? 😍 😋 🍕",
		"Ok, devo assaggiarla! 😍 😋 🍕"
	];

	config.tags = [
		"pizzacapricciosa",
		"pizzapizza",
		"pizzanapoletana",
		"pizzaanapoli",
		"pizzamargherita",
		"pizzagourmet",
		"pizzatime",
		"pizzalover",
		"pizzafritta"
	];

	config.basic_timeline_interaction_limit = 10;
	config.basic_timeline_interaction_comments_chance = 0;
	config.follow_by_timeline = 5;

	config.basic_hashtag_interaction_limit = 10;
	config.basic_hashtag_interaction_comments_chance = 0.20;
	config.follow_by_hashtag = 5;

	config.story_mass_view_enabled = true;


	await setup(config);

	const timelineFeed = new TimelineFeed();

	//these will be the actual tags used in this session
	store.setState({ tagsToExplore: config.tags });

	let stillToDo,
		actions = ["timeline", "hashtag", "storymassview"];
	while (actions.length > 0) {
		//choose a random action
		const currentAction = actions[random(0, actions.length)];

		try {
			switch (currentAction) {
				//Interactions picker for timeline feed
				case "timeline":
					logger.info("[MAIN CONTROLLER] Starting timeline feature");
					stillToDo = await timeline(
						timelineFeed,
						random(1, Math.min(10, config.basic_timeline_interaction_limit))
					);

					if (!stillToDo) actions = actions.filter(e => e !== "timeline");

					break;

				//Interactions picker for hashtag feeds
				case "hashtag":
					logger.info("[MAIN CONTROLLER] Starting hashtag feature");
					stillToDo = await hashtag();

					if (!stillToDo) actions = actions.filter(e => e !== "hashtag");

					break;

				case "storymassview":
					logger.info("[MAIN CONTROLLER] Starting story massview");
					await storyMassView();
					actions = actions.filter(e => e !== "storymassview");
					break;

				default:
					logger.error(
						"[MAIN CONTROLLER] Erorr: unknown action - %s",
						currentAction
					);
					break;
			}
		} catch (error) {
			if(error && error.message && error.message.includes('feedback_required')){
				logger.warn(`[CONTROLLER] Instagram has blocked certain features, fallback procedure to avoid further detection.`);
				await simulateUserInteraction();
				logger.warn(`[CONTROLLER] Fallback procedure has been completed, trying to resume tasks from config.`);
			}
		}

		
	}
	logger.info("[MAIN CONTROLLER] No actions left to do, terminating");
}

main();
