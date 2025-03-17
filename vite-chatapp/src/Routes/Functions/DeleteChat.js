import {useMutation} from '@tanstack/react-query';
import {queryClient} from '../../App'

export const deleteChatMutation = (chat, setSiteError) => {
    const mutation = useMutation({
        mutationFn: () => {
            fetch(`http://localhost:9000/api/${chat}/chat/delete`, {
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
        onSuccess: async () => {
            return await queryClient.invalidateQueries({queryKey: ['chats']});
        }
    });

    return mutation;
}