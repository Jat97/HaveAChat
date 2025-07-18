import {useMutation} from '@tanstack/react-query';
import {client} from '../../../client'

export const deleteChatMutation = (chat, setSiteError) => {
    const mutation = useMutation({
        mutationFn: async () => {
            return await fetch(`http://127.0.0.1:9000/api/${chat.user2.username}/chat/delete`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onMutate: async () => {
            await client.invalidateQueries({queryKey: ['chats']});

            const chat_cache = client.getQueryData(['chats']);
            const chatArr = chat_cache || [];

            chatArr.forEach((item, index) => {
                if(item.user2.id === chat.user2.id) {
                    chatArr.splice(index, 1);
                }
            });

            return {chatArr}
        },
        onError: (err, data, context) => {
           client.setQueryData(['chats'], context.chatArr);
        },
        onSettled: () => {
            client.invalidateQueries({queryKey: ['chats']});
        }
    });

    return mutation;
}