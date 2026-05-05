import {useMutation} from '@tanstack/react-query';
import {query_client} from '../../../client';

export const useHiddenStatusMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async () => {
            return await fetch('http://127.0.0.1:9000/api/hidden/toggle', {
                method: 'PATCH',
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
        onMutate: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});

            const log_cache = query_client.getQueryData(['logged']);

            const updated_user = {
                ...log_cache,
                logged_user: {
                    ...log_cache.logged_user,
                    hidden: log_cache.logged_user.hidden ? false : true
                }             
            }

            query_client.setQueryData(['logged', updated_user]);

            return {log_cache};
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['logged'], context.log_cache);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});
        }
    });

    return mutation;
}

export const useEditPictureMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async (upload) => {
            const file = new File([upload], 'upload.jpg');

            const form = new FormData();

            form.append('profilepicture', file);

            return await fetch('http://127.0.0.1:9000/api/profile/picture', {
                method: 'PATCH',
                credentials: 'include',
                body: form
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
            await query_client.invalidateQueries({queryKey: ['logged']});

            const log_cache = query_client.getQueryData(['logged']);

            const logged = {
                ...log_cache,
                logged_user: {
                    ...log_cache.logged_user,
                    profile_picture: data.upload
                }
            };

            query_client.setQueryData(['logged'], logged);

            return {log_cache};
            
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['logged'], context.log_cache);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});
        }
    });

    return mutation;
};

export const useRemoveFriendMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: (data) => {
            fetch(`http://127.0.0.1:9000/api/${data.username}/unfriend`, {
                method: 'DELETE',
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
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await client.cancelQueries({queryKey: ['logged']});

            const log_cache = client.getQueryData(['logged']);

            const updated_friends = log_cache.friends.filter(friend => friend.username !== data.user.username);

            query_client.setQueryData(['logged'], {
                ...log_cache,
                friends: updated_friends
            })

            return {log_cache}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['logged'], context.log_cache);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries(['logged']);
        }
    });

    return mutation;

};

export const useBlockUserMutation = ([disableBlockWarning, setSiteError]) => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            return await fetch(`http://127.0.0.1:9000/api/${data.username}/block`, {
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
            await client.cancelQueries({queryKey: ['logged']});

            const log_cache = query_client.getQueryData(['logged']);
            const chat_cache = query_client.getQueryData(['chats']);
            const chat_arr = chat_cache?.chats || [];
            
            const blocked_users = [...log_cache.blocked_users];
            const chats = [...chat_arr];
            
            blocked_users.push({
                id: 1,
                blocked_user: data.user.id,
                blocked_by: log_cache.logged_user.id
            });
            
            chats.filter(chat => chat.chat.user.id !== user.id);

            query_client.setQueryData(['logged'], {
                ...log_cache,
                blocked_users: blocked_users
            });
            
            query_client.setQueryData(['chats'], chats);
            
            return {block_arr, chat_arr}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['logged'], context.block_arr);
            query_client.setQueryData(['chats'], context.chat_arr);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});
            await query_client.invalidateQueries({queryKey: ['chats']});
        }
    });

    return mutation;
}

export const useUnblockUserMutation = ([setSiteError]) => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            return await fetch(`http://127.0.0.1:9000/api/${data.username}/unblock`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => {
                if(!res.ok) {
                    throw Error(`Error ${res.status}: ${res.statusText}`);
                }
                
                return res.json();
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await query_client.invalidateQueries({queryKey: ['logged']});

            const log_cache = query_client.getQueryData(['logged']);
            
            const blocked_users = [...log_cache.blocked_users];

            const block_without_user = blocked_users.filter(block => block.id !== data.user.id);

            query_client.setQueryData(['logged'], {
                ...log_cache,
                blocked_users: block_without_user
            });

            return {block_arr}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['logged'], context.block_arr);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});
        }
    });

    return mutation;
}

export const useLogOutMutation = (setSiteError) => {
    const mutation = useMutation({
        mutationFn: async () => {
            return await fetch('http://127.0.0.1:9000/api/logout', {
                method: 'PATCH',
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
        onMutate: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});

            const log_cache = query_client.getQueryData(['logged']);

            const logged = {
                ...log_cache.logged_user,
                online: false
            }

            query_client.setQueryData(['logged'], {
                ...log_cache,
                logged_user: logged
            });

            return {log_cache}
        },
        onError: (err, data, context) => {
            query_client.setQueryData(['logged'], context.log_cache);
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});
        }
    });

    return mutation;
};

export const useDeleteAccountMutation = ([navigate, setSiteError]) => {
    const mutation = useMutation({
       mutationFn: async () => {
            return await fetch('http://127.0.0.1:9000/api/user', {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => {
                if(!res.ok) {
                    return res.json();
                }
                else {
                    navigate('/api/login', {rewrite: true});
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onSuccess: async () => {
            await query_client.invalidateQueries({queryKey: ['logged']});
        }
    });

    return mutation;
};