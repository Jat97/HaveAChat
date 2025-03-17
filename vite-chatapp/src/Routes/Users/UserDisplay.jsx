import {useMutation} from '@tanstack/react-query';
import {CameraIcon, UserIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../Context/ChatStore';

const UserDisplay = (props) => { 
    const logged = props.props[0];
    const user = props.props[1];

    const setSiteError = useChatStore((state) => state.setSiteError);

    const changePictureMutation = useMutation({
        mutationFn: () => {
            fetch('http://localhost:9000/api/profile/picture', {
                method: 'PUT',
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
            return await invalidateQueries({queryKeys: ['user']});
        }
    });

    const editPicture = () => {
        changePictureMutation.mutate();
    }

    return (
        <div>
            <div>
                <div>
                    {user?.profile_picture === null ?
                        <div>
                            <UserIcon />
                        </div>
                    :
                        <img src={user?.profile_picture}></img>  
                    }
                   

                    {logged?.id === user?.id ? 
                        <label data-testid={logged?.username} onChange={() => editPicture()}>
                            <input type='file'></input>
                            <CameraIcon />
                        </label>
                    :
                        null
                    }
                    
                    {user?.online ? 
                        <div></div>
                    :
                        null
                    }
                </div>
               
              <p> {user?.username} </p>
            </div>
            
            <p> {user?.display_name} </p>
        </div>
    )
}

export default UserDisplay;