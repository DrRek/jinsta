import store from '../core/store';
import MediaFeed from './MediaFeed';

export default class TimelineFeed extends MediaFeed {
	constructor(){
		const client = store.getState().client;
		super(client.feed.timeline('pagination'));
	}
}
