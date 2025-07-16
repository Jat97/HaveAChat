import {useNavigate} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {ChatBubbleLeftIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';
import {client} from './../../client';

const ChatButton = (props) => {
    const user = props.props;

    const setSelectedChat = useChatStore((state) => state.setSelectedChat);
    const setChatSearch = useChatStore((state) => state.setChatSearch);
    const setSiteError = useChatStore((state) => state.setSiteError);
    
    const navigate = useNavigate();

    const initiateChatMutation = useMutation({
        mutationFn: async (username) => {
            return await fetch(`http://localhost:9000/api/${username}/chat/initiate`, {
                method: 'PUT',
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
            .catch(err => setSiteError(err.message))
        },
        onMutate: async () => {
            await client.cancelQueries({queryKey: ['chats']});

            const cached = client.getQueryData(['chats']) || [];
            const chatArr = cached.chats || [];

            if(chatArr) {
                await client.setQueryData(['chats'], (prev = {chats: []}) => {
                    return {
                        chats: [
                            ...prev.chats,
                            {
                                id: Date.now(),
                                user2: user.id,
                                last_message_sent: null 
                            }
                        ]
                    }
                })
            }

            return {chatArr}
        },
        onError: (err, data, context) => {
            client.setQueryData(['chats'], context.chatArr);
        },
        onSettled: () => {
            client.invalidateQueries({queryKey: ['chats']});
        }
    });

    const initiateChat = (e) => {
        initiateChatMutation.mutate(e.target.id);
        setSelectedChat(user);
        setChatSearch([]);
        navigate(`/api/${user.username}/chat`);
    }

    return (
        <button type='button' id={user?.username} className='cursor-pointer flex justify-around items-center 
            text-white font-semibold bg-sky-400 rounded-2xl w-[100px] active:bg-sky-200 hover:bg-sky-200' 
            onClick={(e) => initiateChat(e)}>
            <ChatBubbleLeftIcon className='h-6' />
            Chat
        </button> 
    )
}

export default ChatButton;