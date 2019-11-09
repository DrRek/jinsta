import { sleep, random } from '../core/utils';
export default class MediaFeed {
	private feed: any;
	private items: any[];

	constructor(feed) {
		if (new.target === MediaFeed) {
			throw new TypeError(
				'Cannot construct MediaFeed instances directly, it\'s an abstract class.'
			);
		}
		this.feed = feed;
		this.items = [];
	}

	public nextMedia = async (): any => {
		if (this.items.length === 0) {
			//sleep for 1 to 3 tenths of seconds
			await sleep(random(1, 3) / 10);
			this.items = await this.feed.items();
		}

		return this.items.shift();
	};
}
