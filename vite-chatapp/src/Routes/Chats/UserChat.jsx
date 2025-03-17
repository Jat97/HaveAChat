import {useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {PaperAirplaneIcon, PaperClipIcon, TrashIcon, XMarkIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';
import {queryClient} from '../../App';
import {useFetchLogged} from '../Functions/FetchLogged';
import {useFetchMessages} from '../Functions/FetchMessages';
import {useFetchChats} from '../Functions/FetchChats';
import {deleteChatMutation} from '../Functions/DeleteChat';
import UserDisplay from '../Users/UserDisplay';
import Message from './Message';

const UserChat = () => {
    const [image, setImage] = useState(null);

    const setSiteError = useChatStore((state) => state.setSiteError); 

    const {username} = useParams();   

    const logData = useFetchLogged(setSiteError);
    const chatData = useFetchChats(setSiteError);
    const messageData = useFetchMessages([username, setSiteError]);

    const user_chat = chatData.data.chats.find((chat) => chat.user2.username === username);

    const addFile = () => {
        const file = document.querySelector('#message_file');

        setImage(file.files[0]);

        const file_reader = new FileReader();

        file_reader.addEventListener('loadend', () => {
            file_reader.readAsDataURL(file_reader.result);
        });
    }

    const removeFile = () => {
        setImage(null);
    }

    const messageMutation = useMutation({
        mutationFn: () => {
            fetch(`http://localhost:9000/api/${userid}/message`, {
                method: 'GET',
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
            return await queryClient.invalidateQueries({queryKey: ['messages']});
        }
    });

    const sendMessage = () => {
        messageMutation.mutate();
    }

    return (
        <div>
            <div>
                <UserDisplay props={[logData.data.logged_user, user_chat?.user2]} />
                
                <Link to='/api/chats'>
                    <TrashIcon />
                </Link>
            </div>
            

            <div>
                {messageData.data?.messages.map(message => {
                    return <Message props={[message.text, message.sending_user?.id === user_chat?.user1?.id 
                        ? user_chat?.user1 : user_chat?.user2]} 
                    />
                })}

                <div>
                    {image === null ?
                        null
                    :  
                        <div>
                            <XMarkIcon onClick={() => removeFile()}/>
                            <img src={image}></img>
                        </div>
                    }

                    <input type='text' placeholder='Enter your message...'></input>

                    <div>
                        <label onChange={() => addFile()}>
                            <input id='message_file' type='file'></input>
                            <PaperClipIcon />
                        </label>

                        <button type='button' onClick={() => sendMessage()}>
                            <PaperAirplaneIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserChat;