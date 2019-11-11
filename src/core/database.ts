import logger from './logging';
import store from './store';

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

const { MONGODB_URL, MONGODB_DATABASE } = process.env;
const NAMESPACE = 'DATABASE';
const COLLECTION_FOLLOWER = 'follow';

const connect = (callback): void => {
	MongoClient.connect(
		MONGODB_URL,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(error, client) => {
			if (error) {
				logger.error(`[${NAMESPACE} error while connecting - %o]`, error);
				throw error;
			}
			callback(client);
		}
	);
};

const saveManyFollow = (follow): void => {
	connect(client => {
		const { config } = store.getState();
		const database = client.db(MONGODB_DATABASE);
		const collection = database.collection(COLLECTION_FOLLOWER);
		const myPk = config.user.pk;

		follow = follow.map(({pk, timestamp}) => ({
			_id: `${myPk}:${pk}`,
			from: myPk,
			to: pk,
			timestamp: timestamp
		}));

		collection.insertMany(follow, (error) => {
			if (error) {
				logger.error(`[${NAMESPACE} error while inserting - %o]`, error);
				throw error;
			}

			client.close();
		});
	});
};

const deleteManyFollow = (unfollow): void => {
	connect(client => {
		const database = client.db(MONGODB_DATABASE);
		const collection = database.collection(COLLECTION_FOLLOWER);

		const idsToRemove = {
			_id: {
				$in: unfollow.map(({ from, to }) => `${from}:${to}`)
			}
		};

		collection.deleteMany(idsToRemove, (error) => {
			if (error) {
				logger.error(`[${NAMESPACE} error while deleting - %o]`, error);
				client.close();
				throw error;
			}

			client.close();
		});
	});
};

export { saveManyFollow, deleteManyFollow };
