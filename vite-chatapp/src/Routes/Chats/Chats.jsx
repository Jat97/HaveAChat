import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {ChatBubbleLeftRightIcon, EllipsisHorizontalIcon, ExclamationCircleIcon, TrashIcon, UserIcon} from '@heroicons/react/24/solid';
import {client} from './../../client';
import {useChatStore} from '../../Context/ChatStore';
import {useDeleteChatMutation} from '../Functions/Mutations/ChatMutations';
import {useFetchChats} from '../Functions/Queries/ChatQuery';
import {useFetchLogged, useFetchUsers} from '../Functions/Queries/UserQueries';
import dayjs from 'dayjs';
import UserDisplay from '../Users/UserDisplay';
import Search from '../Inputs/Search/Search';
import SearchTab from '../Inputs/Search/SearchTab';
import UserChat from './UserChat';
import BlockButton from '../Buttons/BlockButton';
import AccountButton from '../Users/Profile/AccountButton';
import ChatLoad from '../Miscellaneous/Loading/ChatLoad';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Chats = () => {
    const selected_chat = useChatStore((state) => state.selected_chat);
    const setSelectedChat = useChatStore((state) => state.setSelectedChat);
    const chat_search = useChatStore((state) => state.chat_search);
    const setChatSearch = useChatStore((state) => state.setChatSearch);
    const account_tab = useChatStore((state) => state.account_tab);
    const setAccountTab = useChatStore((state) => state.setAccountTab);
    const authorized = useChatStore((state) => state.unauthorized);
    const setAuthorized = useChatStore((state) => state.setUnauthorized);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const mobileView = useChatStore((state) => state.mobileView);

    const chatData = useFetchChats([authorized, setAuthorized, setSiteError]);
    const userData = useFetchUsers([authorized, setAuthorized, setSiteError]);
    const logData = useFetchLogged([authorized, setAuthorized, setSiteError]);

    const navigate = useNavigate();
    
    useEffect(() => {
        if((!mobileView && !selected_chat) && chatData.isSuccess) {
            setSelectedChat(chatData.data?.chats[0]?.user);
        } 
        
    }, [mobileView, selected_chat, chatData]);

    const [chatMenu, setChatMenu] = useState(null);

    const delete_chat_mutation = useDeleteChatMutation(setSiteError);
        
    const removeChat = (e) => {
        const chat_to_delete = chatData.data.chats.find(chat => chat.id === e.target.id);
        
        delete_chat_mutation.mutate({chat: chat_to_delete});
    }

    const searchUsers = (e) => {
        const user_copy = [...userData.data.users];

        const reg = new RegExp(e.target.value, 'i');

        user_copy.forEach((user, index) => {
            chatData.data.chats.forEach(chat => {
                if(user.id === chat.user.id) {
                    user_copy.splice(index, 1);
                }
            });
        });

        if(e.currentTarget.value === '') {
            disableSearchTab();
        }
        else {
            setChatSearch(user_copy.filter(user => reg.test(user.username) || reg.test(user.display_name)));
        }
    }

    const chooseChat = (e) => {
        const user = userData.data.users.find((user) => user.username === e.currentTarget.id);
        setSelectedChat(user);
        navigate(`/api/${user.username}/chat`);
    }

    const toggleChatMenu = (chat) => {
        setChatMenu(chatMenu === chat ? disableChatMenu() : chat);

        if(chat_search.length > 0) {
            disableSearchTab();
        }
    }

    const disableChatMenu = () => {
        setChatMenu(null);
    }

    const disableSearchTab = () => {
        setChatSearch([]);
    }

    const disableTabs = () => {
        disableChatMenu();
        disableSearchTab();
    }

    if(chatData.isLoading) {
        return <ChatLoad />
    }

    return (
        <div className='flex flex-col h-screen'>
            <div className={`${mobileView && selected_chat ? 'hidden' : `relative flex flex-col items-center my-2 
                w-full md:w-full`} `} onClick={() => disableChatMenu()}>
                <Search props={searchUsers} />
                
                {chat_search.length > 0 &&
                    <SearchTab props={chat_search} />
                } 

                <div className='absolute top-0 right-0'>
                    <AccountButton />
                </div>
            </div>

            <div className={`${mobileView && chat_search.length > 0 ? 'hidden' : 
                'flex justify-between items-center w-11/12 md:border-t md:border-t-slate-200 md:w-full'}`}
                {...(account_tab && {onClicl: setAccountTab})}>
                {chatData.data?.chats.length === 0 ? 
                    <div className='absolute top-[250px] flex flex-col items-center w-full' 
                    onClick={() => disableSearchTab()}>
                        <ChatBubbleLeftRightIcon className='h-36 stroke-slate-200 md:h-40' />

                        <p className='text-lg md:text-xl'> Looks like you don't have any chats right now! </p>
                    </div>
                :
                    <div className={'flex flex-grow overflow-hidden h-screen w-full'}>
                        <ul className={`${mobileView && selected_chat ? 'hidden' :  `w-full max-h-[calc(100vh-55px)] 
                            md:flex md:flex-col md:items-start md:border-r md:border-r-slate-200 md:overflow-y-auto md:w-1/4`}`}>
                            {chatData.data?.chats.map(chat => {
                                return (
                                    <li data-testid={chat.user.username} id={chat.user.username} 
                                        className={`flex gap-x-3 items-center inset-shadow-sm shadow-blue-200 my-2 px-2 
                                            w-full md:relative
                                        ${chat.messages[chat.messages.length - 1].sending_user === chat.user.id 
                                            && chat.messages[chat.messages.length - 1].checked === false ? 
                                            'font-semibold bg-slate-200/50' : ''}`} onClick={(e) => chooseChat(e)}>
                                        <div className='flex flex-col items-start w-full hover:bg-slate-200' 
                                            onClick={() => disableTabs()}>
                                            <div className='relative flex justify-between gap-x-10 items-center w-6/7'>
                                                <UserDisplay props={[chat.user, false, 'queue']} />
                                                
                                                <div className='absolute right-[-50px] w-2/5 z-30 
                                                    md:right-[-25px] md:w-1/6'
                                                    onClick={(e) => e.stopPropagation()}>
                                                    <button className={`${chatMenu === chat.id ? 'relative top-[40px]' : ''}`} 
                                                        data-testid={`ellipses-${chat.id}`} 
                                                        id={chat.id} onClick={() => toggleChatMenu(chat.id)}>
                                                        <EllipsisHorizontalIcon  className='h-8 active:stroke-zinc-200 
                                                        hover:stroke-zinc-200'/>
                                                    </button>
                                                    
                                                    {chatMenu === chat.id && (
                                                        <div className='relative top-[25px] right-[60px] font-semibold flex 
                                                            flex-col items-center border border-slate-200 w-[125px] z-30 
                                                            md:top-[10px] md:right-[40px] md:w-[100px]'
                                                            onClick={() => setChatMenu(null)}>
                                                            <BlockButton props={[chat.user, logData.data?.blocked_users]} />

                                                            <button data-testid={`delete-${chat.id}`} id={chat.id} type='button' 
                                                                className='flex justify-center items-center text-lg
                                                                bg-red-400 p-2 w-[125px] md:text-base md:p-0 md:w-full active:bg-pink-200 hover:bg-pink0-200' 
                                                                onClick={(e) => removeChat(e)}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className='flex justify-between gap-x-12 items-center w-full'>
                                                <p className='text-lg text-slate-400 max-w-[200px] truncate 
                                                    md:text-base md:w-1/2'> 
                                                    {chat.messages.length === 0 ?
                                                        'Chat initiated'
                                                    :
                                                        chat.messages[chat.messages.length - 1]?.text
                                                    } 
                                                </p>  
                                            
                                                <p className='text-base text-center text-slate-200 md:text-xs md:w-3/4'> 
                                                    {chat.messages.length === 0 ? 
                                                        '' 
                                                    : 
                                                        dayjs().to(chat.messages[chat.messages.length - 1]?.sent)
                                                    } 
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        {selected_chat && (
                            <UserChat props={[selected_chat, disableTabs]} />
                        )}
                    </div> 
                }
            </div>
        </div>
    ) 
}

export default Chats;