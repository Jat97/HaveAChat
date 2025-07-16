import {useMutation} from '@tanstack/react-query';
import {client} from '../../../client';

export const useBlockMutation = ([user, logged, blocklist, disableBlockWarning, setSiteError]) => {
    const mutation = useMutation({
        mutationFn: async () => {
            return await fetch(`http://localhost:9000/api/${user.username}/block/toggle`, {
                method: blocklist.some((blocked) => blocked.blocked_user.id === user.id ? 'DELETE' : 'POST'),
                credentials: 'include'
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async () => {
            await client.cancelQueries({queryKey: ['blocked']});

            const block_cache = client.getQueryData(['blocked']);
            const blockArr = block_cache.blocked_users || [];
            const chat_cache = client.getQueryData(['chats']);
            const chatArr = chat_cache?.chats || [];

            if(blockArr.length === 0) {
                client.setQueryData(['blocked'], {
                    blocked_users: [
                        {
                            id: Date.now(),
                            blocked_user: user,
                            blocked_by: logged.data.logged_user
                        }
                    ]
                });
            }
            else {
                blockArr.forEach((block) => {
                    if(block.id === user.id) {
                        const list_without_user = blockArr.filter(blocked => blocked.id !== user.id);
                        client.setQueryData(['blocked'], {blocked_users: list_without_user});
                    }
                    else {
                        client.setQueryData(['blocked'], (prev = []) => { 
                            return {
                                blocked_users: [
                                   ...prev,
                                    {
                                        id: Date.now(),
                                        blocked_user: user,
                                        blocked_by: logged,
                                    } 
                                ]
                            }
                        });
                    }
                }); 
            }

            chatArr.forEach(chat => {
                if(chat.user2.id === user.id) {
                    client.setQueryData(['chats'], {chats: chatArr.filter(convo => convo.id !== chat.id)})
                }
            });  
            
            return {blockArr, chatArr}
        },
        onError: (err, data, context) => {
            client.setQueryData(['blocked'], context.blockArr);
            client.setQueryData(['chats'], context.chatArr);
        },
        onSettled: () => {
            client.invalidateQueries({queryKeys: ['blocked']});
            client.invalidateQueries({queryKeys: ['chats']});

            if(disableBlockWarning) {
                disableBlockWarning();
            }
        }
    });

    return mutation;
};