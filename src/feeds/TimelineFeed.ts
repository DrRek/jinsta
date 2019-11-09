import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { mediaFeed } from './utils';
import { store } from '../core/store';
import logger from '../core/logging';
import MediaFeed from './MediaFeed';

export default class TimelineFeed extends MediaFeed {
	constructor(){
		const client = store.getState().client;
		super(client.feed.timeline('pagination'));
	}
}
