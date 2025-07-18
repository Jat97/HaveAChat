import {Link} from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className='flex flex-col items-center'>
            <p className='text-xl'> Sorry, you do not have access to this page. </p>
            
            <p className='text-lg'> 
                Please <Link to='/api/login' className='text-blue-600 hover:underline'>sign into</Link> your account to view this page. 
                If you do not have an account, you may create one 
                <Link to='/api/signup' className='text-blue-600 hover:underline'>here.</Link>
            </p>
        </div> 
    )
}

export default Unauthorized;