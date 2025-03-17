import {http, HttpResponse} from 'msw';
import {users} from './mock_data/mock_users'
import {chats} from './mock_data/mock_chats';
import {messages} from './mock_data/mock_messages';

const getResponse = (property, data) => {
    return HttpResponse.json({[property] : data});
}

const blockRequest = () => {
    return HttpResponse.json(null, {
        status: 403
    });
}

export const requests = [
    http.post('http://localhost:9000/api/login', () => {
        return new HttpResponse(null, {
            headers: {
                'Set-Cookie': 'usertoken=SAJDJASFLSDFLSFL3928492389P392SDJVKNV; Path=/api',
            },
        });
    }),

    http.post('http://localhost:9000/api/signup', () => {      
        return new HttpResponse(null, {
            headers: {
                'Set-Cookie': 'signtoken=CNXCNVDKHGOREJDOASKOIHUREWOJR424OIOK; Path=/api',
            }
        });
    }),

    http.get('http://localhost:9000/api/user', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        return getResponse('logged_user', users.rows[0]);
    }),

    http.get('http://localhost:9000/api/index', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        console.log(cookies);

        const user_list = users.rows.filter(user => user.id !== users.rows[0].id); 

        return getResponse('users', user_list);
    }),

    http.get('http://localhost:9000/api/chats', ({cookies}) => {
        console.log(cookies);
        if(cookies.usertoken === undefined && cookies.signtoken === undefined) {
            return blockRequest(); 
        }

        console.log(cookies.signtoken);

        if(cookies.signtoken !== undefined) {
            chats.rows = [];
        }

        return getResponse('chats', chats.rows);
    }),

    http.get('http://localhost:9000/api/:username/chat', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        const chat_messages = messages.rows.filter(message => message.receiving_user.id !== users.rows[0].id);

        return getResponse('messages', chat_messages);
    }),

    http.get('http://localhost:9000/api/friends', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        const friends = {
            rows: [
                {
                    user1: users.rows[0],
                    user2: users.rows[1]
                },
                {
                    user1: users.rows[0],
                    user2: users.rows[2]
                }
            ]
        }

        return getResponse('friends', friends.rows);
    }),

    http.put('http://localhost:9000/api/:username/friend/toggle', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        return getResponse(undefined, undefined);
    }),

    http.get('http://localhost:9000/api/blocked', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        const blocked = {
            rows: [
                {
                    blocked_user: users.rows[3],
                    blocked_by: users.rows[0]
                }
            ]
        }

        return getResponse('blocked_users', blocked.rows);
    }),

    http.put('http://localhost:9000/api/:username/block/toggle', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        return getResponse(undefined, undefined);
    }),

    http.put('http://localhost:9000/api/profile/picture', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        return getResponse(undefined, undefined);
    }),

    http.delete('http://localhost:9000/api/chat/:chatid/delete', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        return getResponse(undefined, undefined);
    }),

    http.get('http://localhost:9000/api/search', ({request, cookies}) => {
        const url = new URL(request.url);
        const searched_username = url.searchParams.get('query');

        if(!cookies.usertoken) {
            return blockRequest(); 
        }
        else if(!searched_username) {
            return null;
        }

        const found_user = users.rows
            .find(user => user.display_name === searched_username || user.username === searched_username);

        const search = {
            rows: [
                found_user
            ]
        }

        return getResponse('users', search.rows);
    }),

    http.delete('http://localhost:9000/api/user/delete', ({cookies}) => {
        if(!cookies.usertoken) {
            return blockRequest(); 
        }

        return getResponse(undefined, undefined);
    })
];