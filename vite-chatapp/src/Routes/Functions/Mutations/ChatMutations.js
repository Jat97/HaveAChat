import {useMutation} from '@tanstack/react-query';
import {query_client} from '../../../client'

export const useInitiateChatMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            return await fetch(`http://127.0.0.1:9000/api/${data.username}/chat/initiate`, {
                method: 'POST',
                credentials: 'include'
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`Error ${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await query_client.cancelQueries({queryKey: ['chats']});

            const chat_cache = query_client.getQueryData(['chats']);
            const user_cache = query_client.getQueryData(['users']);
            const chat_arr = chat_cache.chats || [];
            const user_arr = user_cache.users || [];

            const updated_chats = [...chat_arr];

            const selected_user = user_arr.filter(user => user.username === data.username);

            updated_chats.push({
                id: updated_chats.length + 1,
                user: selected_user
            });

            return {chat_arr}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['chats'], context.chat_arr);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['chats']});
        }
    });
};

export const useSendMessageMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            const form = new FormData();

            if(image.file) {
                const file = new File([image.file], 'upload.jpg');

                form.append('chatimage', file); 
            }

            form.append('text', data.message);

            setImage({file: null, reader: null});

            return await fetch(`http://127.0.0.1:9000/api/${data.user.username}/message`, {
                method: 'POST',
                credentials: 'include',
                body: form
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await query_client.cancelQueries({queryKey: ['chats']});

            const log_cache = query_client.getQueryData(['logged']);
            const message_cache = query_client.getQueryData(['chats']);
            const message_arr = message_cache?.messages || [] 

            const messages = [...message_arr];

            messages.push({
                id: messages.length + 1,
                sending_user: log_cache.logged_user.id,
                receiving_user: data.user.id,
                text: data.text,
                image: data.image && data.image
            });

            query_client.setQueryData(['chats'], messages);

            return {message_arr}
        },
        onError: async (err, data, context) => {
            await query_client.setQueryData(['chats'], context.message_arr);
        },
        onSuccess: () => {
            query_client.invalidateQueries({queryKey: ['chats']});
        }
    });

    return mutation;
};

export const useAcceptChatRequestMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            return await fetch(`http://127.0.0.1:9000/api/chat/${data.id}/accept`, {
                method: 'POST',
                credentials: 'include'
            })
            .then(res => {
                if(!res.ok) {
                    throw Error(`Error ${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await query_client.invalidateQueries({queryData: ['chats']});

            const log_cache = query_client.getQueryData(['logged']);
            const chat_cache = query_client.getQueryData(['chats']);
            const chat_arr = chat_cache.chats || [];
            const user_cache = query_client.getQueryData(['users']);
            const user_arr = user_cache.users || [];

            const chats = [...chat_arr];
            const logged = {...log_cache};

            for(const chat of chats) {
                if(chat.request.id === data.id) {
                    chat = {
                        ...chat,
                        request: null
                    }
                }
            };

            for(const user of user_arr) {
                if(user.id === data.request.requesting_user) {
                    logged.friends.push(user);
                }
            }

            query_client.setQueryData(['chats'], chats);
            query_client.setQueryData(['logged'], logged);

            return {log_cache, message_arr}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['chats'], context.message_arr);
            query_client.invalidateQueries(['logged'], context.log_cache);
        },
        onSuccess: async () =>{
            await query_client.invalidateQueries({queryKey: ['chats']});
            await query_client.invalidateQueries({queryKey: ['logged']});
        }
    });

    return mutation;
};

export const useRejectChatRequestMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async (id) => {
            return await fetch(`http://127.0.0.1:9000/api/chat/${id}/reject`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => {
                if(!res.ok) {
                    throw Error(`Error ${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await query_client.invalidateQueries({queryKey: ['chats']});
            
            const chat_cache = query_client.getQueryData(['chats']);
            const chat_arr = chat_cache.chats || [];

            const chats = [...chat_arr];

            for(const chat of chats) {
                if(chat.request.id === data) {
                    chat = {
                        ...chat,
                        request: null
                    }
                }
            };

            query_client.setQueryData(['chats'], chats);

            return {chat_cache}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['chats'], context.chat_cache);
        },  
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['chats']});
        }
    });

    return mutation;
}

export const useDeleteChatMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            return await fetch(`http://127.0.0.1:9000/api/${data.chat.user.username}/chat/delete`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`Error ${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await query_client.invalidateQueries({queryKey: ['chats']});

            const chat_cache = query_client.getQueryData(['chats']);
            const chat_arr = chat_cache || [];

            chat_arr.filter(item => item.id !== data.chat.id);

            return {chat_arr}
        },
        onError: (err, data, context) => {
           query_client.setQueryData(['chats'], context.chat_arr);
        },
        onSuccess: async () => {
           await query_client.invalidateQueries({queryKey: ['chats']});
        }
    });

    return mutation;
};