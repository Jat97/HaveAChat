import SearchAccountLoad from "./SearchAccountLoad";

const IndexLoad = () => {
    const indexArr = [0, 1, 2, 3, 4, 5];

    return (
        <div className='animate-pulse h-screen'>
            <SearchAccountLoad />

            <ul className='flex flex-col items-center w-full'>
                {indexArr.map(arr => {
                    return (
                        <li key={arr} className='flex flex-col items-center border-b border-b-zinc-200 w-full md:w-1/2'>
                            <div className='flex justify-between items-center md:w-3/4'>
                                <div className='flex justify-start items-center p-2'>
                                    <div className='bg-slate-200 rounded-full p-8 w-2'></div>

                                    <div className='flex flex-col items-center ml-4 w-full'>
                                        <div className='bg-slate-200 rounded-full my-2 p-2 w-[75px]'></div> 
                                        <div className='bg-slate-200 rounded-full p-1 w-[50px]'></div>
                                    </div>  
                                </div>
                                
                                <div className='bg-slate-200 rounded-full p-2 w-[100px]'></div>
                            </div>
                        </li>   
                    )
                })}
            </ul>
        </div>
    )
}

export default IndexLoad;