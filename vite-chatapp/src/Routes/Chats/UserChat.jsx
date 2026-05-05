import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PaperAirplaneIcon, PaperClipIcon, XMarkIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';
import {useSendMessageMutation, useAcceptChatRequestMutation, useRejectChatRequestMutation} from '../Functions/Mutations/ChatMutations'
import {useFetchLogged} from '../Functions/Queries/UserQueries';
import {useFetchChats} from '../Functions/Queries/ChatQuery';
import UserDisplay from '../Users/UserDisplay';
import Message from './Message';
import ChatReturn from '../Buttons/ChatReturn';

const UserChat = (props) => {    
    const user = props.props[0];
    const disableTabs = props.props[1];

    const navigate = useNavigate();

    const [image, setImage] = useState({file: null, reader: null});

    const mobileView = useChatStore((state) => state.mobileView);
    const authorized = useChatStore((state) => state.unauthorized);
    const setAuthorized = useChatStore((state) => state.setUnauthorized);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const setSelectedChat = useChatStore((state) => state.setSelectedChat);

    const logData = useFetchLogged([authorized, setAuthorized, setSiteError]);
    const chatData = useFetchChats([user?.username, authorized, setAuthorized, setSiteError]);
    
    const message_mutation = useSendMessageMutation(setSiteError);
    const accept_request_mutation = useAcceptChatRequestMutation(setSiteError);
    const reject_request_mutation = useRejectChatRequestMutation(setSiteError);

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

    const sendMessage = () => {
        message_mutation.mutate({user: user, text: document.querySelector('#message_input').value, image: image.file});
        document.querySelector('#message_input').value = '';
    }

    const acceptRequest = (e) => {
        accept_request_mutation.mutate({id: e.target.id})
    }

    const rejectRequest = (e) => {
        reject_request_mutation.mutate({id: e.target.id});
        
        setSelectedChat(null);
        navigate('/api/chats');
    }
    
    if(chatData.isLoading) {
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

            {chatData?.data?.request &&
                <div className='flex flex-col items-center mb-2 w-full md:border md:border-black md:p-2 md:w-full'>
                    <p className='text-lg text-center font-semibold'> 
                        This user has sent you an invitation to chat with them! 
                    </p>
    
                    <div className='flex justify-around items-center font-semibold my-2 w-2/3 md:w-1/2'>
                        <button id={chatData.data.request?.id} 
                            className='bg-emerald-400 rounded-full p-1 w-2/5 md:p-0 hover:bg-green-200'
                            onClick={(e) => acceptChatRequest(e)}>
                            Accept
                        </button>
    
                        <button id={chatData.data.request?.id} className='bg-red-400 rounded-full p-1 w-2/5 md:p-0 hover:bg-pink-200'
                            onClick={(e) => rejectChatRequest(e)}>
                            Ignore
                        </button> 
                    </div>
                </div>
            }
            
            <div className='flex flex-col flex-grow'>
                <div className='flex-grow overflow-y-auto my-1 px-1 md:h-[calc(100vh-120px)]'>
                    {chatData?.data?.messages.map(message => {
                        return <Message props={[
                            message, 
                            message.sending_user === logData.data?.logged_user.id ? true : false
                        ]} />
                    })}
                </div>    

                {!chatData.data.request && 
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