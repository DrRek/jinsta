import store from '../core/store';
import logger from '../core/logging';

export default async (): boolean => {
	const NAMESPACE = 'FOLLOW'
	const { client } = store.getState();
	const userId = (await client.user.searchExact('cpmax8')).pk;
	const { following } = await client.friendship.destroy(userId);

	if(following){
		logger.warn(`[${NAMESPACE} unable to unfollow user %o]`, userId);
		return false;
	}
	return true;
}