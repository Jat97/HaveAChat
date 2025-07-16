import {ExclamationTriangleIcon} from '@heroicons/react/24/solid';

const PageError = (props) => {
    const error = props.props;

    return (
        <div className='animate-bounce absolute flex flex-col items-center left-1/3 bottom-0 
            border border-slate-400 shadow-sm shadow-slate-200 p-1 w-1/3'>
            <div className='flex justify-around items-center w-2/3'>
                <ExclamationTriangleIcon className='h-8 stroke-red-400' />
                <p className='font-semibold text-base text-red-400'> {error} </p>
            </div>
        </div>
   
    )
};

export default PageError;