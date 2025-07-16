import {useChatStore} from '../../../Context/ChatStore';
import {useBlockMutation} from '../../Functions/Mutations/BlockMutation';
import {useFetchLogged} from '../../Functions/Fetch/FetchLogged';
import {useFetchChats} from '../../Functions/Fetch/FetchChats';

const BlockWarning = (props) => {
    const user = props.props[0];
    const blocklist = props.props[1];
    const setBlockWarning = props.props[2];

    const selected_chat = useChatStore((state) => state.selected_chat);
    const setSelectedChat = useChatStore((state) => state.setSelectedChat);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const logData = useFetchLogged(setSiteError);
    const chatData = useFetchChats(setSiteError);
    
    const disableBlockWarning = () => {
        setBlockWarning(false);
    }
    
    const {mutate} = useBlockMutation([user, logData, blocklist, disableBlockWarning, setSiteError]);
    
    const toggleBlock = () => {
        mutate();

        if(selected_chat.id === user.id) {
            setSelectedChat(chatData.data.chats[0].user2);
        }
    }

    return (
        <div className='fixed top-0 left-0 bg-slate-400/50 h-screen w-screen'>
            <div className='absolute top-[350px] flex flex-col items-center bg-white border rounded-xl 
                w-full md:top-[250px] md:right-[275px] md:w-1/2'>
                <p className='text-xl md:text-lg'> Are you sure you want to block {user.username}? </p>
                <p className='text-base md:text-sm'> This will delete your chat with them. </p>
                 
                <div className='flex justify-around items-center my-4 w-2/3 md:w-1/2'>
                    <button className='bg-emerald-200 rounded-full w-[100px] hover:bg-lime-200' onClick={() => toggleBlock()}>
                        Confirm 
                    </button>
                    <button className='bg-zinc-200 rounded-full w-[100px] hover:bg-slate-200' onClick={() => disableBlockWarning()}>
                        Cancel 
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BlockWarning;