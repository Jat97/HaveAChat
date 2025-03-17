import {useMutation} from '@tanstack/react-query';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchLogged} from '../../Functions/FetchLogged';
import UserDisplay from '../UserDisplay';

const Account = () => {
    const setSiteError = useChatStore((state) => state.setSiteError);

    const logData = useFetchLogged(undefined);

    const deleteAccountMutation = useMutation({
        mutationFn: () => {
            fetch('/api/user/delete', {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else if(res.redirected) {
                    window.location.href = res.url;
                }
                else {
                    return res.json();
                }
            })
            .catch(err => setSiteError(err.message))
        },
        onSuccess: async () => {
            return await queryClient.invalidateQueries({queryKey: ['user']});
        }
    });

    const deleteAccount = () => {
        deleteAccountMutation.mutate();
    }

    return (
        <div>
            <UserDisplay props={[logData.data.logged_user, logData.data.logged_user]} />

            <button type='button' onClick={() => deleteAccount()}>
                Delete
            </button>
        </div>
    )  
}

export default Account;