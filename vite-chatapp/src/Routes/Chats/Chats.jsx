import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useQuery, useMutation} from '@tanstack/react-query';
import {MagnifyingGlassIcon, TrashIcon} from '@heroicons/react/24/solid';
import {queryClient} from '../../App';
import {useChatStore} from '../../Context/ChatStore';
import {useFetchChats} from '../Functions/FetchChats';
import UserDisplay from '../Users/UserDisplay';

const Chats = () => {
    const setSiteError = useChatStore((state) => state.setSiteError);

    const chatData = useFetchChats(setSiteError);

    const deleteChatMutation = useMutation({
        mutationFn: (e) => {
            fetch(`/api/${e.target.id}/chat/delete`, {
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
        onSuccess: async () => {
            return await queryClient.invalidateQueries({queryKey: ['chats']});
        }
    });

    const removeChat = () => {
        deleteChatMutation.mutate();
    }

    // const initiateSearch = 
    
    return (
        <div>
            <div>
                <form method='GET' action='/api/search' encType='application/json'>
                    <input type='search' name='query' placeholder='Find someone to chat with...'></input>
                    
                    <button data-testid='search' type='submit'>
                        <MagnifyingGlassIcon /> 
                    </button>
                </form>

                {chatData.data?.chats.map(chat => {
                    return (
                        <Link to={`/api/${chat.user2.display_name}/chats`}>
                            <UserDisplay props={[undefined, chat.user2]} />

                            <div>
                                <div>
                                   <p> {chat.last_message_sent.text} </p> 
                                   <p></p> 
                                </div>
                               
                                <p> {chat.last_message_sent.sent} </p>
                            </div>

                            <button id={chat.id} data-testid={chat.id} type='button' onClick={(e) => removeChat(e)}>
                                <TrashIcon />
                            </button>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default Chats;