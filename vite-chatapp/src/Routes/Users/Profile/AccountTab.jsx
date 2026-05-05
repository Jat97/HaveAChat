import {useMutation} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import {UserGroupIcon, NoSymbolIcon, XMarkIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../../Context/ChatStore';
import {useHiddenStatusMutation, useLogOutMutation, useDeleteAccountMutation} from '../../Functions/Mutations/UserMutations';
import {useFetchLogged} from '../../Functions/Queries/UserQueries';
import UserDisplay from '../UserDisplay';
import {client} from '../../../client';

const AccountTab = (props) => {
    const toggleTab = props.props;

    const authorized = useChatStore((state) => state.authorized);
    const setAuthorized = useChatStore((state) => state.setAuthorized);
    const setSiteError = useChatStore((state) => state.setSiteError);

    const logData = useFetchLogged([authorized, setAuthorized, setSiteError]);

    const hidden_mutation = useHiddenStatusMutation(setSiteError);
    const logout_mutation = useLogOutMutation(setSiteError);
    const delete_account_mutation 

    const toggleOnlineStatus = () => {
        hidden_status_mutation.mutate();
    }

    const logOut = () => {
        logout_mutation.mutate();
    } 

    const deleteAccount = () => {
        delete_account_mutation.mutate();
    }

    return (
        <div className={`absolute top-0 right-0 flex flex-col items-center bg-white h-screen w-screen z-50 
            md:fixed md:bg-slate-200/75 md:w-1/5`}>
            <XMarkIcon className='absolute right-0 h-8 fill-slate-400 z-50 hover:fill-white' onClick={toggleTab} />

            <div className='flex flex-col items-center my-4 w-screen md:w-full'>
               <UserDisplay props={[undefined, true, 'profile']} /> 

               <div className='flex justify-around items-center w-2/3'>
                    <p className='text-lg md:text-base'> Hide activity </p>

                    <button data-testid='hide_status' type='button' className={`flex justify-between items-center 
                        border-solid border-slate-500 rounded-3xl w-14 md:w-10 
                        ${logData.data?.logged_user.online ? 'bg-fuchsia-400' : 'bg-slate-200'}`} 
                        onClick={() => toggleOnlineStatus()}>
                        <div className={logData.data?.logged_user.hidden 
                            ? null : `border border-solid 
                            border-slate-400 rounded-3xl shadow-sm shadow-slate-500 bg-white p-3 w-1/5 md:p-2`}>
                        </div>
                        
                        <div className={logData.data?.logged_user.hidden
                            ? `border border-solid 
                            border-slate-400 rounded-3xl shadow-sm shadow-slate-500 bg-white p-3 w-1/5 md:p-2` : null}>
                        </div>
                    </button>
               </div>
            </div>
            
            <div className='flex flex-col items-center text-lg w-full md:text-base'>
                <div className='flex justify-around items-center my-2 w-2/3'>
                    <UserGroupIcon className='h-8 fill-slate-400 md:h-6' />
                    <Link to='/api/friends' onClick={toggleTab}> Manage friendslist </Link>
                </div>

                <div className='flex justify-around items-center my-2 w-2/3'>
                    <NoSymbolIcon className='h-8 fill-slate-400 md:h-6' />
                    <Link to='/api/blocked' onClick={toggleTab}> Manage block list </Link>
                </div>
            
                <button type='button' className='cursor-pointer font-semibold bg-slate-200 my-1 p-2 w-full md:p-1 hover:bg-zinc-100' 
                    onClick={() => logOut()}>
                    Logout
                </button>
                
                <button type='button' className='cursor-pointer font-semibold bg-red-200 my-1 p-2 w-full md:p-1 hover:bg-pink-300' 
                    onClick={() => deleteAccount()}>
                    Delete account
                </button>
            </div>
        </div>
    )  
}

export default AccountTab;