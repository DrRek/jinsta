import store from '../core/store';
import logger from '../core/logging';
import { deleteManyFollow } from '../core/database';

export default async (): boolean => {
	const NAMESPACE = 'FOLLOW';
	const { config, client } = store.getState();
	const userId = (await client.user.searchExact('cpmax8')).pk;
	// const { following } = await client.friendship.destroy(userId);

	// if(following){
	// 	logger.warn(`[${NAMESPACE} unable to unfollow user %o]`, userId);
	// 	return false;
	// }

	deleteManyFollow([{
		from: config.user.pk,
		to: userId
	}])

	return true;
};