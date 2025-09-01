// import { createClient } from 'redis';

// async function main() {
//   const client = createClient({
//     username: 'default',
//     password: '8wZuAdmxLPbLL2pFHt1ADReUpU8qLnh7',
//     socket: {
//       host: 'redis-18607.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
//       port: 18607,
//       tls: true, 
//     }
//   });

//   client.on('error', err => console.error('Redis Client Error', err));

//   await client.connect();

//   await client.set('foo', 'bar');
//   const result = await client.get('foo');
//   console.log(result);

// //   await client.quit(); 
// }

// main().catch(console.error);

import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: '8wZuAdmxLPbLL2pFHt1ADReUpU8qLnh7',
    socket: {
        host: 'redis-18607.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18607
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result) 

