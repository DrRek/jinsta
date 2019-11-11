import store from '../core/store';
import logger from '../core/logging';
import { saveManyFollow } from '../core/database';

export default async (pk: number): boolean => {
	const NAMESPACE = 'FOLLOW';
	const { config, client } = store.getState();
	const { following } = await client.friendship.create(pk);
	
	if(!following){
		logger.warn(`[${NAMESPACE} unable to follow user %o]`, pk);
		return false;
	}

	saveManyFollow([{
		from: config.user.pk,
		to: pk,
		timestamp: new Date()
	}]);

	return true;
};