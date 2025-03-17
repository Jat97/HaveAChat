import {users} from './mock_users';

export const messages = {
    rows: [
        {
            id: '1',
            sending_user: users.rows[0],
            receiving_user: users.rows[1],
            text: 'Hey, how are you?',
            sent: '02/12/2025',
            checked: false  
        },
        {
            id: '2',
            sending_user: users.rows[2],
            receiving_user: users.rows[0],
            text: `I don't think I'm very familiar with Morrowind. Is that the one with the giant fleas?`,
            sent: '02/14/2025',
            checked: false 
        }
    ]
}