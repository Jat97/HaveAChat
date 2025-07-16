import {useChatStore} from "../../../Context/ChatStore";
import SearchAccountLoad from "./SearchAccountLoad";

const ChatLoad = () => {
    const chatLoadArr = [0, 1, 2, 3];
    
    const mobileView = useChatStore((state) => state.mobileView);

    return (
        <div className='animate-pulse flex flex-col items-center'>
            <SearchAccountLoad />

            <div className={`w-full md:border-t md:border-t-slate-200 ${mobileView ? 'flex flex-col items-center' : ''}`}>
                <div className='w-11/12 md:w-full'>
                    <div className='flex items-center flex-overgrow overflow-hidden w-full'>
                        <ul className='max-h-[calc(100vh-55px)] w-full md:w-1/3'>
                            {chatLoadArr.map(arr => {
                                return (
                                    <li key={arr} className='flex flex-col w-full'>
                                        <div className='flex justify-between items-center w-4/5'>
                                            <div className='flex justify-between items-center md:w-3/5'>
                                                <div className='bg-slate-200 rounded-full p-8 w-1'></div>

                                                <div className='bg-slate-200 rounded-full ml-2 p-2 w-[100px]'></div>
                                            </div>
                                            
                                            <div className='bg-slate-200 rounded-full p-2 w-[40px]'></div>
                                        </div>

                                        <div className='flex justify-evenly items-center my-2 w-full'>
                                            <div className='bg-slate-200 rounded-full p-2 w-[150px]'></div>

                                            <div className='bg-slate-200 rounded-full p-1.5 w-[25px]'></div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        <div className='hidden md:flex md:flex-col md:h-full md:w-full'>
                            {chatLoadArr.map(arr => {
                                return (
                                    <div className={`flex flex-col bg-slate-200 rounded-tl-xl rounded-tr-xl p-10 max-w-xs
                                        ${arr % 2 === 0 ? 'self-start rounded-bl-xs rounded-br-xl ml-4' 
                                        : 'self-end rounded-bl-xl rounded-br-xs mr-4'}`}>
                                    </div>
                                )
                            })}

                            <div className='flex justify-start items-end mt-5 w-full'>
                                <div className='bg-slate-200 rounded-full p-5 w-5/6'></div>

                                <div className='flex justify-around items-center w-1/6'>
                                    <div className='bg-slate-200 rounded-full p-3 w-[50px]'></div>
                                    <div className='bg-slate-200 rounded-full p-3 w-[50px]'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatLoad;