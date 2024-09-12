import { createClient } from 'redis';

export const test = catchAsync(async (req, res, next) => {
	const client = createClient({
		//redis[s]://[[username][:password]@][host][:port][/db-number]
		url: 'http://localhost:6379/',
	});

	client.on('error', (err) => console.log('Redis Client Error', err));

	await client.connect();

	// Check specific keys
	const pattern = '*';
	await client.keys(pattern);

	//------------
	// Check number of keys in database
	await client.dbsize();

	//------------
	// set key value
	await client.set('key', 'value');
	await client.set('key', 'value', {
		EX: 10,
		NX: true,
	});

	//------------
	// get value by key
	const value = await client.get('key');

	//------------
	//syntax : delete keys
	await client.del('key');
	const keyArr = ['key1', 'key2', 'key3'];
	await client.del(...keyArr);

	//------------
	// Check if key exists
	await client.exists('key');

	//------------
	// set expiry to key
	const expireInSeconds = 30;
	await client.expire('key', expireInSeconds);

	//------------
	// remove expiry from key
	await client.persist('key');

	//------------
	// find (remaining) time to live of a key
	await client.ttl('key');

	//------------
	// increment a number
	await client.incr('key');

	//------------
	// decrement a number
	await client.decr('key');

	//------------
	// use the method below to execute commands directly
	await client.sendCommand(['SET', 'key', 'value']);

	//todo make an CN=
});
