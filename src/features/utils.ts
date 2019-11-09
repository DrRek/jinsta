import { IgApiClient } from 'instagram-private-api';
import { Feed } from 'instagram-private-api/dist/core/feed';
import { Config } from '../core/config';
import { media$ } from '../streams/media';
import { sleep, chance } from '../core/utils';
import logger from '../core/logging';
import { addServerCalls, store } from '../core/store';

export const defaultMediaValidator = (media: any): boolean => {
	const config = store.getState().config;
	
	if (media.ad_id || media.link) {
		logger.info('[FILTER] media was an ad with id: %s / link: %s', media.ad_id, media.link);
		return false;
	}
	if (media.has_liked) {
		logger.warn('[FILTER] media was already liked. %s ', media.id);
		return false;
	}
	if (!media.caption) {
		logger.warn('[FILTER] media didn\'t have a caption. %s ', media.id);
		return false;
	}

	const { text } = media.caption;
	let badWord;
	if((badWord = config.findBlacklistedWord(text))){
		logger.warn('[FILTER] media %s matched blacklist word %s', media.id, badWord);
		return false;
	}

	const { baseInterest, interestInc } = config;
	return chance(config.getInterestRate(text, baseInterest, interestInc));
};

/**
	Used to calculate how many likes to give in each tag without exceding the maximum like number.
	Input: config with likeLimit and tags.
	Return: an array of length tags.length and as value integer number which together will sum up to be (approximately) likeLimit.
*/
export function likesForTags(config: Config): Array<number> {
	const likeNumber = config.likeLimit;
	const tagsNumber = config.tags ? config.tags.length : 0;
	if (!likeNumber || !tagsNumber) return [];

	let sum = 0;
	const array = [];

	for (let i = 0; i < tagsNumber; i++) {
		const current = Math.random() * 100;
		sum += current;
		array.push(current);
	}

	return array.map(i => Math.round((i / sum) * likeNumber));
}
