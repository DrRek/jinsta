import logger from '../core/logging';

export default class MediaFeed {
	private feed: any;
	private items: any[];

	constructor(feed){
		logger.info('MediaFeed');
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

/*
export async function mediaFeed<T>(
	client: IgApiClient,
	config: Config,
	feed: Feed<T>,
	cb = (): boolean => true,
): Promise<void> {
	const allMediaIDs: string[] = [];
	let running = true;
	let progress = 1;

	while (running) {
		const items = await feed.items();
		addServerCalls(1);

		// filter out old items
		const newItems = items.filter(item => !allMediaIDs.includes(item.id));
		allMediaIDs.push(...newItems.map(item => item.id));

		logger.info(
			'[MEDIA FEED] got %d more media for user \'%s\'',
			newItems.length,
			config.username,
		);

		// exit when no new items are there
		if (!newItems.length) running = false;

		for (const item of newItems) {
			logger.info(
				'[MEDIA FEED] current progress: %d / %d',
				progress,
				allMediaIDs.length,
			);

			if(!defaultMediaValidator(item, config))
				media$.next(item);

			progress++;
			await sleep(config.mediaDelay);

			// break out when callback returns true
			if (!cb()) {
				running = false;
				break;
			}
		}
	}
}*/