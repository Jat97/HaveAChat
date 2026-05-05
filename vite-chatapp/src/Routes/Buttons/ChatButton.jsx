import {useNavigate} from 'react-router-dom';
import {ChatBubbleLeftIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';
import {useInitiateChatMutation} from '../Functions/Mutations/ChatMutations';

const ChatButton = (props) => {
    const user = props.props;

    const setSelectedChat = useChatStore((state) => state.setSelectedChat);
    const setChatSearch = useChatStore((state) => state.setChatSearch);
    const setSiteError = useChatStore((state) => state.setSiteError);
    
    const navigate = useNavigate();

    const initiate_mutation = useInitiateChatMutation(setSiteError);

    const initiateChat = () => {
        initiateChatMutation.mutate(user);
        setSelectedChat(user);
        setChatSearch([]);
        navigate(`/api/${user.username}/chat`);
    }

    return (
        <button type='button' className='cursor-pointer flex justify-around items-center 
            text-white font-semibold bg-sky-400 rounded-2xl w-[100px] active:bg-sky-200 hover:bg-sky-200' 
            onClick={() => initiateChat()}>
            <ChatBubbleLeftIcon className='h-6' />
            Chat
        </button> 
    )
}

export default ChatButton;