import {setupServer} from 'msw/node';
import {requests} from './requests';
import {afterAll, afterEach, beforeAll} from 'vitest'

const server = setupServer(...requests);

beforeAll(() => server.listen());

beforeEach(() => {
    document.cookie = 'usertoken=SAJDJASFLSDFLSFL3928492389P392SDJVKNV'
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());