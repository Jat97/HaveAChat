import {useMutation} from '@tanstack/react-query';
import {useChatStore} from '../../Context/ChatStore';
import {client} from './../../client';

const FriendButton = (props) => {
    const user = props.props;

    const setSiteError = useChatStore((state) => state.setSiteError);

    const friendMutation = useMutation({
        mutationFn: () => {
            fetch(`http://localhost:9000/api/${user.username}/unfriend`, {
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
            .catch(err => setSiteError(err.message))
        },
        onMutate: async () => {
            await client.cancelQueries({queryKey: ['friends']});

            const friend_cache = client.getQueryData(['friends']);
            const friendArr = friend_cache.friends || [];

            client.setQueryData(['friends'], () => {
                friendArr.forEach((friend, index) => {
                    if(friend.id === user.id) {
                        client.setQueryData(['blocked'], friendArr.splice(index, 1));
                    }
                });
            });

            return {friendArr}
        },
        onError: (err, data, context) => {
            client.setQueryData(['friends'], context.friendArr);
        },
        onSettled: () => {
            client.invalidateQueries(['friends']);
        }
    });

    const toggleFriend = () => {
        friendMutation.mutate();
    }

    return (
        <button id={user.username} data-testid={user.username} type='button' 
            className='text-sm text-white font-semibold bg-red-300 rounded-full p-0.5 w-[100px] 
            md:text-base md:w-[150px] active:bg-pink-200 hover:bg-pink-200' 
            onClick={() => toggleFriend()}>
            Remove
        </button>
    )
}

export default FriendButton;