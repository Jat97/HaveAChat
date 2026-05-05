import {useState, useEffect} from 'react';
import {useLocation, Link} from 'react-router-dom';
import {ChatBubbleLeftIcon, ChevronLeftIcon, ExclamationCircleIcon} from '@heroicons/react/24/solid';
import {useFetchUsers} from '../Functions/Fetch/FetchUsers';
import {useFetchFriends} from '../Functions/Fetch/FetchFriends';
import {useFetchBlocked} from '../Functions/Fetch/FetchBlocked';
import {useChatStore} from '../../Context/ChatStore';
import FriendButton from '../Buttons/FriendButton';
import BlockButton from '../Buttons/BlockButton';
import UserDisplay from './UserDisplay';
import AccountButton from './Profile/AccountButton';
import ChatReturn from '../Buttons/ChatReturn';
import IndexLoad from '../Miscellaneous/Loading/IndexLoad';

const UserIndex = () => {
    const [data, setData] = useState(); 

    const account_tab = useChatStore((state) => state.account_tab);
    const authorized = useChatStore((state) => state.authorized);
    const setAccountTab = useChatStore((state) => state.setAccountTab);
    const setAuthorized = useChatStore((state) => state.setAuthorized);
    const setSiteError = useChatStore((state) => state.setSiteError);

    const location = useLocation();

    const userData = location.pathname.includes('index') && useFetchUsers([authorized, setAuthorized, setSiteError]);

    const logData = (location.pathname.includes('friends') || location.pathname.includes('blocked')) 
        && useFetchLogged([authorized, setAuthorized, setSiteError]);

    useEffect(() => {
        if(userData?.isSuccess) {
            setData(userData.data?.users);
        }
        else if(logData?.isSuccess && location.pathname.includes('friends')) {
            setData(logData.data?.friends);
        }
        else if(logData?.isSuccess && location.pathname.includes('blocked')) {
            setData(logData.data?.blocked_users);
        } 
    }, [userData?.isSuccess, logData?.isSuccess]);

    const indexSearch = (e) => {
        if(e.target.value === '') {
            if(location.pathname.includes('index')) {
                setData(userData.data.users);
            }
            else if(location.pathname.includes('friends')) {
                setData(logData.data.friends);
            }
            else {
                setData(logData.data.blocked_users);
            }
        }
        else {
            const reg = new RegExp(e.target.value, 'i');

            const filtered_list = data.filter(user => reg.test(user.username) || reg.test(user.display_name));

            setData(filtered_list);
        }
    }

    if(userData?.isLoading || logData?.isLoading) {
        return <IndexLoad />
    }

    return (
        <div className='flex flex-col items-center bg-slate-50 md:min-h-screen'>
            <div className='flex justify-between my-4 w-screen md:w-full'>  
                <ChatReturn /> 

                <input type='text' className='bg-slate-400 border border-slate-200 rounded-xl w-2/3 md:w-1/2
                    focus:bg-white focus:border focus:border-black' placeholder='Search for a particular user'
                    onChange={(e) => indexSearch(e)} onClick={account_tab && setAccountTab}>
                </input>

                <AccountButton />     
            </div>

            <p className='text-lg text-center font-semibold ml-2 my-2' onClick={account_tab && setAccountTab}> 
                {userData ? `All results for ${location.params}` : friendData ? 'Your friends' : 'Blocked users'} 
            </p>
            
            {data?.length === 0 ?
                <div className='absolute top-[300px] flex flex-col items-center' 
                onClick={account_tab && setAccountTab}>
                    <ExclamationCircleIcon className='h-20 fill-zinc-400' />
                    <p className='text-xl font-semibold mt-2'> There's nothing here! </p>
                </div>
            :
                <div className='flex flex-col items-center w-full md:w-1/2' onClick={account_tab && setAccountTab}>
                    {data?.map(item => {
                        return (
                            <div className='flex justify-between items-center border-b 
                                border-b-slate-200 my-2 p-2 w-full'>
                                <UserDisplay props={[item, false, 'index']} />

                                {location.pathname.includes('friends') ?
                                    <FriendButton props={item} />
                                :
                                    location.pathname.includes('blocked') ?
                                        <BlockButton props={[item, data]} />
                                    :
                                        <Link to={`/api/${item.username}/chat`} 
                                            className='flex justify-around items-center text-white font-semibold 
                                            bg-sky-400 rounded-2xl p-0.5 w-1/5 hover:bg-sky-200'>
                                            <ChatBubbleLeftIcon className='h-6' />
                                            Chat
                                        </Link>
                                }
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    )
}

export default UserIndex;