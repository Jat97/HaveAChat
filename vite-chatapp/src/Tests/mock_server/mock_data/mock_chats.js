import {users} from './mock_users';
import {messages} from './mock_messages';

export const chats = {
    rows: [
        {
            id: '1',
            user1: users.rows[0],
            user2: users.rows[1],
            last_message_sent: messages.rows[0]
        },
        {
            id: '2',
            user1: users.rows[0],
            user2: users.rows[2],
            last_message_sent: messages.rows[1]
        },
        {
            id: '3',
            user1: users.rows[0],
            user2: users.rows[4],
            last_message_sent: messages.rows[2]
        }
    ]
}