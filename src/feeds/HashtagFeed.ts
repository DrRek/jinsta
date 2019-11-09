import { store } from '../core/store';
import MediaFeed from './MediaFeed';

export default class HashtagFeed extends MediaFeed {
	constructor(hashtag: string){
		const { client } = store.getState();
		super(client.feed.tags(hashtag, 'recent'));
	}
}