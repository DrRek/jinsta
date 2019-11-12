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
				logger.error(
					`[${NAMESPACE} error while connecting - %o]`,
					error
				);
				throw error;
			}
			callback(client);
		}
	);
};

const saveManyFollow = (follow): void => {
	connect(client => {
		logger.warn('DATABASE HAS BEEN CALLED %o', follow);
		const { config } = store.getState();
		const database = client.db(MONGODB_DATABASE);
		const collection = database.collection(COLLECTION_FOLLOWER);
		const myPk = config.user.pk;

		//just a further check to avoid having duplicates in the array
		const filteredFollow = [];
		follow.map(({ pk, timestamp }) => {
			if (!filteredFollow.find(({ to }) => pk === to))
				filteredFollow.push({
					_id: `${myPk}:${pk}`,
					from: myPk,
					to: pk,
					timestamp: timestamp
				});
			else
				logger.warn(
					`[${NAMESPACE}] Duplicates where stripped from follow to save %o`,
					follow
				);
		});

		collection.insertMany(filteredFollow, error => {
			if (error) {
				logger.error(
					`[${NAMESPACE} error while inserting - %o]`,
					error
				);
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

		collection.deleteMany(idsToRemove, error => {
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
