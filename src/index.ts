import setup from './main';
import { Config } from './core/config';
import { TimelineFeed, HashtagFeed } from './feeds';
import { basicMediaInteraction } from './features';

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

	basicMediaInteraction,
	/*timeline,
	hashtag,
	storyMassView,*/
};
