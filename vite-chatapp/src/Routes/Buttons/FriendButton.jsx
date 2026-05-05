import {useMutation} from '@tanstack/react-query';
import {useChatStore} from '../../Context/ChatStore';
import {useRemoveFriendMutation} from '../../Functions/Mutations/UserMutations';
import {query_client} from './../../client';

const FriendButton = (props) => {
    const user = props.props;

    const setSiteError = useChatStore((state) => state.setSiteError);

    const remove_friend_mutation = useRemoveFriendMutation(setSiteError);

    const removeFriend = () => {
        remove_friend.mutate(user);
    }

    return (
        <button id={user.username} data-testid={user.username} type='button' 
            className='text-sm text-white font-semibold bg-red-300 rounded-full p-0.5 w-[100px] 
            md:text-base md:w-[150px] active:bg-pink-200 hover:bg-pink-200' 
            onClick={() => removeFriend()}>
            Remove
        </button>
    )
}

export default FriendButton;