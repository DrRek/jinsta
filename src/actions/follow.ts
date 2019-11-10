import store from '../core/store';
import logger from '../core/logging';
import { saveManyFollow } from '../core/database';

export default async (): boolean => {
	const NAMESPACE = 'FOLLOW';
	const { config, client } = store.getState();
	const userId = (await client.user.searchExact('cpmax8')).pk;
	/*const { following } = await client.friendship.create(userId);
	if(!following){
		logger.warn(`[${NAMESPACE} unable to follow user %o]`, userId);
		return false;
	}*/

	//logger.info('%o',config.user)

	saveManyFollow([{
		from: config.user.pk,
		to: userId,
		timestamp: new Date()
	}])

	return true;
};