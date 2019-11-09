import setup from './main';
import { Config } from './core/config';
import { TimelineFeed, HashtagFeed } from './feeds';
import { basic_interaction } from './features';

/*import {
	timeline,
	hashtag,
	storyMassView,
} from './features';*/

export default setup;

export {
	setup,
	Config,

	TimelineFeed,
	HashtagFeed,

	basic_interaction,
	/*timeline,
	hashtag,
	storyMassView,*/
};
