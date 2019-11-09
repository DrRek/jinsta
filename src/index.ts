import setup from './main';
import { Config } from './core/config';
import { TimelineFeed } from './feeds';
import { basic_timeline_interaction } from './features';

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

	basic_timeline_interaction,
	/*timeline,
	hashtag,
	storyMassView,*/
};
