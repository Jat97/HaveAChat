import {useMutation} from '@tanstack/react-query';
import {useChatStore} from '../../Context/ChatStore';
import {queryClient}  from '../../App';
import {useFetchLogged} from '../Functions/FetchLogged';

const BlockButton = (props) => {
    const user = props.props[0];
    const blocks = props.props[1];

    const setSiteError = useChatStore((state) => state.setSiteError);

    const logData = useFetchLogged(setSiteError);

    const blockMutation = useMutation({
        mutationFn: () => {
            fetch(`http://localhost:9000/api/${user.username}/block/toggle`, {
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
            await queryClient.invalidateQueries({queryKeys: ['blocked']});
        }
    });

    const toggleBlock = () => {
        blockMutation.mutate();
    }

    return (
        <button data-testid={user.username} id={user.username} type='button' onClick={(e) => toggleBlock(e)}>
            {blocks.some((block) => block.blocked_user.id === user.id 
                && block.blocked_by.id === logData.data.logged_user.id) === false ? 
                'Block' 
            : 
                'Unblock'
            }
        </button>
    )
}

export default BlockButton;