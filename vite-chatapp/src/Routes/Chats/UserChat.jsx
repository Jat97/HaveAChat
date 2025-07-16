import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {PaperAirplaneIcon, PaperClipIcon, XMarkIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';
import {client} from './../../client';
import {useFetchLogged} from '../Functions/Fetch/FetchLogged';
import {useFetchMessages} from '../Functions/Fetch/FetchMessages';
import {useFetchUsers} from '../Functions/Fetch/FetchUsers';
import UserDisplay from '../Users/UserDisplay';
import Message from './Message';
import ChatReturn from '../Buttons/ChatReturn';

const UserChat = (props) => {    
    const user = props.props[0];
    const disableTabs = props.props[1];

    const navigate = useNavigate();

    const [image, setImage] = useState({file: null, reader: null});

    const mobileView = useChatStore((state) => state.mobileView);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const setSelectedChat = useChatStore((state) => state.setSelectedChat);

    const logData = useFetchLogged(setSiteError);
    const messageData = useFetchMessages(user?.username, setSiteError);

    const addFile = () => {
        const file = document.querySelector('#message_file');

        const file_reader = new FileReader();

        file_reader.addEventListener('loadend', () => {
            setImage({file: file.files[0], reader: file_reader.result});  
        });
        
        file_reader.readAsDataURL(file.files[0]);
    }

    const removeFile = () => {
        setImage(null);
    }

    const messageMutation = useMutation({
        mutationFn: async (message) => {
            const form = new FormData();

            if(image.file) {
                const file = new File([image.file], 'upload.jpg');

                form.append('chatimage', file); 
            }

            form.append('text', message);

            setImage({file: null, reader: null});

            return await fetch(`http://localhost:9000/api/${user.username}/message`, {
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
            .catch(err => setSiteError(err.message))
        },
        onMutate: async (data) => {
            await client.cancelQueries({queryKey: ['messages', user.username]});
            await client.cancelQueries({queryKey: ['chats']});

            const message_cache = client.getQueryData(['messages', user.username]) || []; 
            const chat_cache = client.getQueryData(['chats']);
            const messageArr = message_cache?.messages || []
            const chatArr =  chat_cache?.chats || [];


            if(messageArr) {
                await client.setQueryData(['messages', user.username], (prev = {messages: []}) => {
                    return {
                        messages: [
                            ...prev.messages,
                            {
                                id: Date.now(),
                                sending_user: logData.data.logged_user.id,
                                receiving_user: user.id,
                                text: data,
                                image: image.file ? image.file : null,
                                sent: Date.now()
                            }
                        ]
                    }
                });

                await client.setQueryData(['chats'], () => {
                    chatArr.map(chat => {
                        if(chat.user2.username === user.username) {
                            return chat.last_message_sent = {
                                sending_user: logData.data.logged_user.id,
                                text: data,
                                sent: new Date(Date.now())
                            }
                        }
                    });
                });
            }

            return {messageArr, chatArr}
        },
        onError: (err, data, context) => {
            client.setQueryData(['messages', user.username], context.messageArr);
            client.setQueryData(['chats'], context.chatArr);
        },
        onSettled: () => {
            client.invalidateQueries({queryKey: ['messages', user.username]});
            client.invalidateQueries({queryKeys: ['chats']});
        }
    });

    const requestMutation = useMutation({
        mutationFn: async (decision) => {
            return await fetch(`http://localhost:9000/api/chat/${decision === 'false' ? 
                'reject' : 'accept'}/${messageData.data.request.id}`, {
                method: decision === 'false' ? 'DELETE' : 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
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
        onMutate: async (data) => {
                await client.cancelQueries({queryKey: ['messages', user.username]});
                await client.cancelQueries({queryKey: ['chats']});

                const message_cache = client.getQueryData(['messages', user.username]);

                const messageArr = client.setQueryData(['messages', user.username], () => {
                    return {
                       messages: data === 'false' ? [] : [...message_cache.messages], request: null 
                    }
                });

                const chat_cache = client.getQueryData(['chats']);

                const chatArr = client.setQueryData(['chats'], () => {
                    return {
                        chats: data === 'false' ? 
                            chat_cache.chats.filter(chat => chat.user2.id !== user.id)
                        : 
                            [...chat_cache.chats]
                    }
                })

                return {messageArr, chatArr};
        },
        onError: (err, data, context) => {
            client.setQueryData(['messages', username], context.messageArr);
            client.setQueryData(['chats'], context.chatArr);
        },
        onSettled: () => {
            client.invalidateQueries({queryKey: ['messages', user.username]});
            client.invalidateQueries({queryKeys: ['chats']});
        }
    });

    const sendMessage = () => {
        messageMutation.mutate(document.querySelector('#message_input').value);
        document.querySelector('#message_input').value = '';
    }

    const handleChatRequest = (e) => {
        requestMutation.mutate(e.target.id);

        if(e.target.id === 'false') {
            setSelectedChat(null);
            navigate('/api/chats');
        }
    }
    
    if(messageData.isLoading) {
       return <div></div>
    }
  
    return (
        <div className='absolute top-0 left-0 flex flex-col mx-auto h-full w-screen md:relative md:w-6/7'
            onClick={disableTabs}>
            <div className='relative w-full md:hidden'>
                <UserDisplay props={[user, false, 'chat']} />
                
                {mobileView && (
                    <div className='absolute top-0 left-0'>
                        <ChatReturn /> 
                    </div>
                )} 
            </div>

            {messageData?.data?.request ? 
                <div className='flex flex-col items-center mb-2 w-full md:border md:border-black md:p-2 md:w-full'>
                    <p className='text-lg text-center font-semibold'> 
                        This user has sent you an invitation to chat with them! 
                    </p>
    
                    <div className='flex justify-around items-center font-semibold my-2 w-2/3 md:w-1/2'>
                        <button id='true' className='bg-emerald-400 rounded-full p-1 w-2/5 md:p-0 hover:bg-green-200'
                            onClick={(e) => handleChatRequest(e)}>
                            Accept
                        </button>
    
                        <button id='false' className='bg-red-400 rounded-full p-1 w-2/5 md:p-0 hover:bg-pink-200'
                            onClick={(e) => handleChatRequest(e)}>
                            Ignore
                        </button> 
                    </div>
                </div>
            :
                null
            }
            
            <div className='flex flex-col flex-grow'>
                <div className='flex-grow overflow-y-auto my-1 px-1 md:h-[calc(100vh-120px)]'>
                    {messageData?.data?.messages.map(message => {
                        return <Message props={[
                            message, 
                            message.sending_user === logData.data?.logged_user.id ? true : false
                        ]} />
                    })}
                </div>    

                {messageData.data.request ? 
                    null
                :
                    <div className='relative bottom-0 bg-zinc-200 border-t border-t-slate-200 p-2 w-full'>
                        {!image?.reader ?
                            null
                        :  
                            <div className='relative inline-block mb-2'>
                                <XMarkIcon className='absolute top-0 right-0 h-7 bg-zinc-300
                                    border rounded-full fill-black z-20 md:h-5 hover:bg-slate-100 ' 
                                    onClick={() => removeFile()}/>
                                <img className='rounded-md max-w-[200px] max-h-[200px] object-cover' src={image.reader}></img>
                            </div>
                        }

                        <div className='flex items-center p-1 w-full'>
                            <input type='text' data-testid='message_input' id='message_input' placeholder='Enter your message...' 
                                className='bg-zinc-400 border-none rounded-full px-2 py-1 w-3/4 focus:bg-white'>
                            </input>

                            <div className='flex justify-around items-center w-1/3 md:w-1/5'>
                                <label className='cursor-pointer'>
                                    <input data-testid='image_input' id='message_file' type='file' className='hidden' 
                                        onChange={() => addFile()}></input>
                                    <PaperClipIcon className='h-6' />
                                </label>

                                <button data-testid='message_button' type='button' onClick={() => sendMessage()} 
                                    className='flex flex-col items-center cursor-pointer bg-violet-400 rounded-full 
                                    p-1 w-[60px] md:w-[75px] hover:bg-pink-200'>
                                    <PaperAirplaneIcon className='h-5 md:h-6' />
                                </button>
                            </div> 
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default UserChat;