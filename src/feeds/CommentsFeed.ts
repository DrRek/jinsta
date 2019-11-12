import store from '../core/store';
import MediaFeed from './MediaFeed';

export default class CommentsFeed extends MediaFeed {
	constructor(id){
		const client = store.getState().client;
		super(client.feed.mediaComments(id));
	}
}
