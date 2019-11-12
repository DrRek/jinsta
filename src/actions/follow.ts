import store from '../core/store';
import logger from '../core/logging';

export default async (pk: number): boolean => {
	const NAMESPACE = 'FOLLOW';
	const { client } = store.getState();
	const res = await client.entity.checkFollow(pk);
	logger.error('SE MAI ARRIVI QUA RICORDATI CHE IN FOLLOW DEVI FARE PRIMA IL CONTROLLO SE LA PERSONA E GIA SEGUITA %o',res);
	const { following } = await client.friendship.create(pk);
	
	if(!following){
		logger.warn(`[${NAMESPACE} unable to follow user %o]`, pk);
		return false;
	}

	return true;
};