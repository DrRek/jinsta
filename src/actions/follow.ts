import store from '../core/store';
import logger from '../core/logging';

export default async (pk: number): boolean => {
	const NAMESPACE = 'FOLLOW';
	const { client } = store.getState();
	const { following } = await client.friendship.create(pk);
	
	if(!following){
		logger.warn(`[${NAMESPACE} unable to follow user %o]`, pk);
		return false;
	}

	return true;
};