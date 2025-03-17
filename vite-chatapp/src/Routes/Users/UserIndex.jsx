import {useSearchParams, useLocation} from 'react-router-dom';
import {useFetchUsers} from '../Functions/FetchUsers';
import {useFetchFriends} from '../Functions/FetchFriends';
import {useFetchBlocked} from '../Functions/FetchBlocked';
import {useChatStore} from '../../Context/ChatStore';
import FriendButton from '../Buttons/FriendButton';
import BlockButton from '../Buttons/BlockButton';
import UserDisplay from './UserDisplay';

const UserIndex = () => {
    const setSiteError = useChatStore((state) => state.setSiteError);

    const location = useLocation();

    const userData = location.pathname.includes('index') || location.pathname.includes('search') ? 
        useFetchUsers(location.search === null ? null : location.search, setSiteError) : undefined;

    const friendData = location.pathname?.includes('friends') ? useFetchFriends(setSiteError) : undefined;
    
    const blockedData = location.pathname?.includes('blocked') ? useFetchBlocked(setSiteError) : undefined;

    const data = userData !== undefined ? userData?.data.users : friendData !== undefined ? friendData.data.friends :  
        blockedData !== undefined ? blockedData.data.blocked_users : null;

    return (
        <div>
            <p> All {userData !== undefined ? 'users' : friendData !== undefined ? 'friends' : 'blocked users'} </p>

            <div>
                {data.map(item => {
                    return (
                        <div>
                            <UserDisplay props={[undefined, userData !== undefined 
                                ? item : blockedData !== undefined ? item.blocked_user : item.user2]} 
                            />

                            {friendData !== undefined ?
                                <FriendButton props={[item.user2, friendData.data.friends]} />
                            :
                                blockedData !== undefined ?
                                    <BlockButton props={[item.blocked_user, blockedData.data.blocked_users]} />
                                :
                                    null
                            }
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default UserIndex;