const LogSign = (props) => {
    const typeid = props.props[0];
    const error = props.props[1];

    return (
        <label className='flex flex-col w-full md:items-start'> 
            <span className='flex justify-start p-1 md:ml-[45px]'>
                {typeid ==='dob' ? 'Date of birth' : typeid.replace(typeid[0], typeid[0].toUpperCase())}
            </span>
            
            <div className='flex justify-center md:w-full'>
                <input id={typeid} data-testid={typeid} 
                    type={typeid === 'dob' ? 'date' : typeid === 'confirm' ? 'password' : typeid} 
                    className={`bg-slate-200 rounded-xl p-1 w-full md:p-0.5 md:w-3/4 focus:bg-white focus:border 
                        focus:border-black ${error !== null ? 'border border-red-400' : null}`} 
                    placeholder={typeid === 'confirm' ? 'Confirm password' : `Enter your ${typeid}`} 
                    min={typeid === 'password' ? '8' : null} max={'20'}>
                </input>
            </div>
        </label>
    )
}

export default LogSign;