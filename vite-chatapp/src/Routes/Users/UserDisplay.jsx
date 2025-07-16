import {useEffect} from 'react';
import {useMutation} from '@tanstack/react-query';
import {CameraIcon, UserIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';
import {useFetchLogged} from '../Functions/Fetch/FetchLogged';

const UserDisplay = (props) => { 
    const setSiteError = useChatStore((state) => state.setSiteError);

    const logData = useFetchLogged(setSiteError);
    
    const user = props.props[0] === undefined ? logData.data?.logged_user : props.props[0];
    const is_logged_user = props.props[1];
    const mode = props.props[2];

    const changePictureMutation = useMutation({
        mutationFn: async (uploadedFile) => {
            const file = new File([uploadedFile], 'upload.jpg');

            const form = new FormData();

            form.append('profilepicture', file);

            return await fetch('http://localhost:9000/api/profile/picture', {
                method: 'PATCH',
                credentials: 'include',
                body: form
            }, uploadedFile)
            .then(res => {
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json({});
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onSuccess: async () => {
            return await invalidateQueries({queryKeys: ['logged']});
        }
    });

    const editPicture = () => {
        changePictureMutation.mutate(document.querySelector('#file_upload').files[0]);
    }

    const getOuterCSS = (mode) => {
        if(mode === 'search') {
            return 'flex-row justify-between w-3/5 md:w-1/2';
        }
        else if(mode === 'profile') {
            return 'items-center';
        }
        else if(mode === 'chat') {
            return 'items-center w-full'
        }
    }

    const getTextCSS = (mode) => {
        if(mode === 'queue' || mode === 'search') {
            return 'text-lg md:text-sm';
        }
        else if(mode === 'index') {
            return 'text-base';
        }
        else if(mode === 'chat') {
            return 'text-2xl';
        }
        else {
            return 'text-lg';
        }
    }

    const getIconCSS = (mode) => {
        if(mode === 'queue') {
            return 'h-8';
        }
        else if(mode === 'search') {
            return 'h-10 md:h-8';
        }
        else if(mode === 'index') {
            return 'h-10';
        }
        else {
            return 'h-20 md:h-16';
        }
    }

    const getDisplayCSS = (mode) => {
        if(mode === 'queue') {
            return 'justify-around';
        }
        else if(mode === 'index') {
            return 'justify-start';
        }
        else if(mode === 'search') {
            return 'justify-start md:justify-around';
        }
        else {
            return 'flex-col items-center'
        }
    }

    const getProfilePicCSS = (mode) => {
        if(mode === 'queue' || mode === 'search') {
            return 'max-w-[60px] md:max-w-[35px]';
        }
        else if(mode === 'profile') {
            return 'max-w-[125px] md:max-w-[100px]';
        }
        else if(mode === 'chat') {
            return 'max-w-[100px]';
        }
        else {
            return 'max-w-[60px] md:max-w-[40px]';
        }
    };

    return (
        <div className={`flex flex-col ${getOuterCSS(mode)}`}>
            <div className={`flex my-1 w-full ${getDisplayCSS(mode)}`}>
                <div className={`relative flex flex-col items-center border border-black rounded-full 
                    ${!user?.profile_picture ? 'bg-slate-200 p-3 md:p-2.5' : ''}`}>
                   {user?.profile_picture === null ?
                        <UserIcon className={`${getIconCSS(mode)}`}/>
                    :
                        <img className={`rounded-full ${getProfilePicCSS(mode)}`} 
                            src={user?.profile_picture} alt='Profile'>
                        </img>  
                    } 

                    {user?.online && 
                        <div className='absolute bottom-0 right-0 bg-green-200 rounded-full p-1.5'></div>
                    }
                </div>
                
                {is_logged_user && 
                    <label data-testid={user?.username}
                        onChange={() => editPicture()}>
                        <input type='file' id='file_upload' className='hidden'></input>

                        <div className='absolute bg-white border border-purple-400 rounded-full -mt-7 ml-5 p-2 
                            hover:bg-fuchsia-200'>
                           <CameraIcon className='h-7 fill-violet-400 md:h-6' /> 
                        </div>
                    </label>
                }
                
                <div className={`flex flex-col ml-4 my-2 ${mode === 'search' ? 'items-start' : 'items-center'}`}>
                    <p className={`font-semibold ${getTextCSS(mode)}`}> 
                        {user?.display_name} 
                    </p>

                    <p className={`text-base text-slate-200 md:text-sm 
                        ${mode === 'queue' || mode === 'chat' ? 'hidden' : ''}`}> 
                        @{user?.username} 
                    </p> 
                </div>
            </div>
        </div>
    )
}

export default UserDisplay;