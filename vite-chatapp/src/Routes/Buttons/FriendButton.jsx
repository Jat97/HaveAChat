import {useMutation} from '@tanstack/react-query';
import {useChatStore} from '../../Context/ChatStore';
import {queryClient} from '../../App';
import {useFetchLogged} from '../Functions/FetchLogged';

const FriendButton = (props) => {
    const user = props.props[0];
    const friends = props.props[1];

    const setSiteError = useChatStore((state) => state.setSiteError);

    const logData = useFetchLogged(setSiteError);

    const friendMutation = useMutation({
        mutationFn: () => {
            fetch(`http://localhost:9000/api/${user.username}/friend/toggle`, {
                method: 'PUT',
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
        onSuccess: async () => {
            return await queryClient.invalidateQueries({queryKey: ['friends']});
        }
    });

    const toggleFriend = () => {
        friendMutation.mutate();
    }

    return (
        <button id={user.username} data-testid={user.username} type='button' onClick={() => toggleFriend()}>
            {friends.some((friend) => friend.user1.id === logData.data.logged_user.id 
                && friend.user2.id === user.id) === false ?
                'Add friend'
            :
                'Remove friend'
            }
        </button>
    )
}

export default FriendButton;