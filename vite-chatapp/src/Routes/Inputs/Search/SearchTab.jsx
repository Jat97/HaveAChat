import {useState} from 'react';
import {XMarkIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../../Context/ChatStore';
import UserDisplay from '../../Users/UserDisplay';
import ChatButton from '../../Buttons/ChatButton';

const SearchTab = (props) => {
    const search_result = props.props;

    const [fullView, setFullView] = useState(false);
    const mobileView = useChatStore((state) => state.mobileView);

    const toggleFullView = () => {
        setFullView(fullView ? false : true);
    }

    return (
        <div className={`absolute top-[37px] flex flex-col items-center h-screen w-screen md:w-full 
            ${fullView ? 'top-0 bg-zinc-200/75' : ''}`}>
            <div className={`z-50 ${fullView ? 
                    `relative left-[50px] p-2 bg-white border border-slate-200 shadow-sm shadow-slate-200 rounded-lg 
                        overflow-y-auto mt-[200px] h-fit w-1/2`
                : 
                    'flex flex-col items-center bg-slate-200 border border-black w-screen md:w-1/3'} 
                    ${mobileView ? 'h-screen' : 'h-fit'}`}>
                        
                {fullView &&
                    <div className='cursor-pointer absolute top-[5px] right-[5px] bg-zinc-200 rounded-full 
                        hover:bg-slate-100'
                        onClick={() => toggleFullView()}>
                        <XMarkIcon className='h-6' />
                    </div>
                }
                
                {search_result.slice(0, fullView || mobileView ? search_result.length : 3).map(result => {
                    return (
                        <div className={`flex items-center my-2 w-full 
                            ${fullView ? 'justify-around md:justify-between md:w-4/5' : 'justify-around'}`}>
                            <UserDisplay props={[result, false, 'search']} />

                            <ChatButton props={result} />
                        </div>
                    )
                })}

                {!fullView && !mobileView && (
                    <p className={'cursor-pointer flex flex-col items-center text-blue-600 my-2 hover:underline'}
                        onClick={() => toggleFullView()}> 
                        View more users 
                    </p>
                )}
            </div> 
        </div>
    )
}

export default SearchTab;