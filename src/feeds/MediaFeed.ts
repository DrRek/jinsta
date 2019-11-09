export default class MediaFeed {
	private feed: any;
	private items: any[];

	constructor(feed){
		if (new.target === MediaFeed) {
	      throw new TypeError('Cannot construct MediaFeed instances directly, it\'s an abstract class.');
	    }
		this.feed = feed;
		this.items = [];
	}

	public nextMedia = async () => {
		if(this.items.length === 0)
			this.items = await this.feed.items();

		return this.items.shift();
	}
}