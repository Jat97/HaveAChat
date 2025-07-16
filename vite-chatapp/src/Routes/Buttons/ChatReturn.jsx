import {useNavigate} from 'react-router-dom';
import {ArrowLeftIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';

const ChatReturn = () => {
    const selected_chat = useChatStore((state) => state.selected_chat);
    const setSelectedChat = useChatStore((state) => state.setSelectedChat);
    
    const navigate = useNavigate();
    
    const returnToDefaultChat = () => {
        if(selected_chat) {
            setSelectedChat(null);
        }
        
        navigate('/api/chats');
    };

    return (
        <div className='cursor-pointer flex justify-between items-center text-lg text-blue-600 font-semibold my-2
            w-[75px] md:justify-around md:text-base hover:underline' onClick={() => returnToDefaultChat()}>  
            <ArrowLeftIcon className='h-7 fill-blue-600 md:h-6' />
            Chats 
        </div> 
    )
}

export default ChatReturn;