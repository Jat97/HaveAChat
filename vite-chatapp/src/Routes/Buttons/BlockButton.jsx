import {useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useFetchLogged} from '../Functions/Fetch/FetchLogged';
import {useBlockMutation} from '../Functions/Mutations/BlockMutation';
import {useChatStore} from '../../Context/ChatStore';
import BlockWarning from '../Miscellaneous/Popups/BlockWarning';

const BlockButton = (props) => {
    const user = props.props[0];
    const blocks = props.props[1];

    const setSiteError = useChatStore(state => state.setSiteError);

    const [blockWarning, setBlockWarning] = useState(false);

    const {mutate} = useBlockMutation([user, undefined, blocks, undefined, setSiteError]);

    const enableBlockWarning = () => {
        setBlockWarning(true);
    }
    
    const location = useLocation();

    return (
        <div className={`${location.pathname.includes('blocked') ? 'flex flex-col items-center' : ''} w-full`}>
            <button data-testid={user.username} id={user.username} type='button' className={`text-lg font-semibold 
                bg-violet-400 p-2 md:text-base md:p-0 active:bg-purple-200 hover:bg-purple-200
                ${location.pathname.includes('blocked') ? 'rounded-full w-30' : 'w-full'} `} 
                onClick={() => blocks.some((block) => block.id === user.id) ? mutate() : enableBlockWarning()}>
                {blocks?.some((block) => block.id === user.id) ?
                    'Unblock'
                : 
                    'Block' 
                }
            </button>

            {blockWarning ?
                <BlockWarning props={[user, blocks, setBlockWarning]} />
            :
                null
            } 
        </div>
    )
}

export default BlockButton;