import logger from './logging';

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

const { MONGODB_URL, MONGODB_DATABASE } = process.env;
const NAMESPACE = 'DATABASE';
const COLLECTION_FOLLOWER = 'follow';

const connect = callback => {
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

const saveManyFollow = follow => {
	connect(client => {
		const database = client.db(MONGODB_DATABASE);
		const collection = database.collection(COLLECTION_FOLLOWER);

		follow = follow.map(item => ({
			_id: `${item.from}:${item.to}`,
			...item
		}));

		collection.insertMany(follow, (error, result) => {
			if (error) {
				logger.error(`[${NAMESPACE} error while inserting - %o]`, error);
				throw error;
			}

			client.close();
		});
	});
};

const deleteManyFollow = unfollow => {
	connect(client => {
		const database = client.db(MONGODB_DATABASE);
		const collection = database.collection(COLLECTION_FOLLOWER);

		const idsToRemove = {
			_id: {
				$in: unfollow.map(({ from, to }) => `${from}:${to}`)
			}
		};

		collection.deleteMany(idsToRemove, (error, result) => {
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
