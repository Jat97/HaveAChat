import {useChatStore} from "../../../Context/ChatStore";

const Search = (props) => {
    const searchUsers = props.props;
    
    const account_tab = useChatStore((state) => state.account_tab);
    const setAccountTab = useChatStore((state) => state.setAccountTab);
    
    return (
        <div className='flex justify-end items-center w-3/4 md:justify-center md:w-3/4'>
            <input data-testid='user_search' id='user_search' className='bg-slate-200 border-2 border-slate-200 rounded-full max-w-md w-full md:p-1  focus:bg-white' 
                placeholder='Find someone to chat with...' onChange={searchUsers} 
                onClick={account_tab ? setAccountTab : null}>
            </input>
        </div>
    )
}

export default Search;