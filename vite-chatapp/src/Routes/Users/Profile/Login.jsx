import {useMutation} from '@tanstack/react-query'; 
import {useChatStore} from '../../../Context/ChatStore';
import {Link} from 'react-router-dom';
import LogSign from '../../Inputs/LogSign';
import LogSignHeading from '../../Miscellaneous/LogSignHeading';
import InputError from '../../Errors/InputError';

const Login = () => {
    const username_error = useChatStore((state) => state.username_error);
    const password_error = useChatStore((state) => state.password_error);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const setUsernameError = useChatStore((state) => state.setUsernameError);
    const setPasswordError = useChatStore((state) => state.setPasswordError);

    const logIn = () => {
        fetch('http://localhost:9000/api/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: document.querySelector('#user').value,
                password: document.querySelector('#password').value
            })
        })
        .then(res => {
            if(res.redirected) {
                window.location = res.url.replace('9000', '5173');
            }
            else if(res.ok === false) {
                throw Error(`${res.status}: ${res.statusText}`);
            }
            else {
                return res.json();
            }
        })
        .then(json => {
            console.log(json.user_err, !json.user_err);
            setUsernameError(!json.user_err  ? null : json.user_err);
            setPasswordError(!json.pass_err  ? null : json.pass_err);
        })
        .catch(err => setSiteError(err.message))
    }

    return (
        <div className='absolute top-[200px] flex flex-col items-center w-screen md:top-1/4 md:left-[400px] 
            md:border md:border-zinc-400 md:shadow-sm md:shadow-slate-200 md:w-5/12'>
            <LogSignHeading props={'Log in and start chatting'} />
            
            <div className='flex flex-col items-center w-3/4 md:m-4 md:w-2/3'>
                <div className='flex flex-col my-2 w-2/3 md:w-full'>
                    <LogSign props={['user', username_error]} />

                    {username_error !== null ? 
                        <InputError props={username_error} />
                    :
                        null
                    }
                </div>

                <div className='flex flex-col my-2 w-2/3 md:w-full'>
                    <LogSign props={['password', password_error]} />

                    {password_error !== null ?
                        <InputError props={password_error} /> 
                    :
                        null
                    }
                </div>
            </div>

            <div className='flex flex-col items-center my-4 md:my-0'>
                <button type='button' className='cursor-pointer text-cyan-400 font-semibold bg-white border border-cyan-400 rounded-full
                    my-2 w-1/2 md:text-white md:bg-cyan-400 md:w-1/2 hover:bg-cyan-200' 
                    onClick={() => logIn()}> 
                    Log in 
                </button>

                <p className='text-base my-4 md:text-sm'> Don't have an account? 
                    <Link to='/api/signup' className='text-blue-500 hover:underline'> Create one! </Link> 
                </p>
            </div>
        </div>
    )
}

export default Login;