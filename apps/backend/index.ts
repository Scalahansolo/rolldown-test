import pLimit from 'p-limit';
import { hello } from '@rolldown-test/common';
import { add, multiply } from '@rolldown-test/utils/math';
import { capitalize } from '@rolldown-test/utils/string';
import { formatDate, formatCurrency } from '@rolldown-test/helpers/format';
import { chunk } from '@rolldown-test/helpers/array';
import { isValidEmail, formatPhone } from '@rolldown-test/helpers/validation';
import { UserService } from './service';
import { ClearCache } from '@rolldown-test/decorators/cache';

console.log(hello());
console.log('Math:', add(5, 3), multiply(4, 2));
console.log('String:', capitalize('hello world'));
console.log('Format:', formatDate(new Date()), formatCurrency(123.45));
console.log('Array:', chunk([1, 2, 3, 4, 5], 2));
console.log('Validation:', isValidEmail('test@example.com'), formatPhone('1234567890'));

const limit = pLimit(2);
const tasks = [1, 2, 3, 4, 5].map(n => 
  limit(() => Promise.resolve(n * 2))
);
const results = await Promise.all(tasks);
console.log('p-limit results:', results);

console.log('\n--- Testing Decorators ---');
const service = new UserService('secret-api-key');
console.log('User:', service.getUserById(123));
console.log('Data (first call):', service.fetchUserData(456));
console.log('Data (cached call):', service.fetchUserData(456));
console.log('Updated:', service.updateUser(789, { name: 'Updated Name' }));
ClearCache();