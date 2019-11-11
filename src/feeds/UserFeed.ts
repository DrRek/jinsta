import store from '../core/store';
import MediaFeed from './MediaFeed';

export default class UserFeed extends MediaFeed {
	constructor(pk){
		const client = store.getState().client;
		super(client.feed.user(pk));
	}
}
