import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';  
import LogSign from '../../Inputs/LogSign';
import LogSignHeading from '../../Miscellaneous/LogSignHeading'; 
import InputError from '../../Errors/InputError';

const Signup = () => {
    const [signErr, setSignErr] = useState({
        display_name: null,
        email: null,
        dob: null,
        passConf: null
    });

    const username_error = useChatStore((state) => state.username_error);
    const password_error = useChatStore((state) => state.password_error);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const setUsernameError = useChatStore((state) => state.setUsernameError);
    const setPasswordError = useChatStore((state) => state.setPasswordError);

    const signUp = () => {
        fetch('http://localhost:9000/api/signup', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.querySelector('#username').value,
                display: document.querySelector('#name').value,
                email: document.querySelector('#email').value,
                dob: document.querySelector('#dob').value,
                password: document.querySelector('#password').value,
                confirm: document.querySelector('#confirm').value
            })
        })
        .then(res => {
            if(res.redirected) {
                window.location.href = res.url.replace('9000', '5173');
                
            }
            if(res.ok === false) {
                throw Error(`${res.status}: ${res.statusText}`);
            }
            else {
                return res.json({});
            }
        })
        .then(json => {
            json.errors.errors.forEach(error => {
                if(error.params === 'user') {
                    setUsernameError(error.msg);
                }
                else if(error.params === 'password') {
                    setPasswordError(error.msg);
                }
                else {
                    setSignErr(prevState => ({
                        ...prevState,
                        [error.params]: error.msg
                    }));
                }
            });
        })
        .catch(err => {
            setSiteError(err.message);
        })
    }

    return (
        <div className='absolute top-[200px] flex flex-col items-center bg-white w-full md:top-[150px]
            md:left-[350px] md:border md:border-zinc-400 md:shadow-sm md:shadow-slate-200 md:md:w-1/2'>
            <LogSignHeading props={'Create your account'} />

            <div className='grid grid-cols-2 justify-around items-center m-4  md:w-5/6'>
                <div className='flex flex-col items-start my-2 w-3/4 md:w-full'>
                    <LogSign props={['username', username_error]} />

                    {username_error !== null ?
                        <InputError props={username_error} />
                    :
                        null
                    }
                </div>

                <div className='flex flex-col items-start w-3/4 md:w-full'>
                    <LogSign props={['name', signErr.display_name]} />

                    {signErr.display_name !== null ?
                        <InputError props={signErr.display_name} />
                    :
                        null
                    }
                </div>
                
                <div className='flex flex-col items-start my-2 w-3/4 md:w-full'>
                    <LogSign props={['email', signErr.email]} />

                    {signErr.email !== null ?
                        <InputError props={signErr.email} />
                    :
                        null
                    }
                </div>

                <div className='flex flex-col items-start w-3/4 md:w-full'>
                    <LogSign props={['dob', signErr.dob]} />

                    {signErr.dob !== null ?
                        <InputError props={signErr.dob} />
                    :
                        null
                    }
                </div>

                <div className='flex flex-col items-start my-2 w-3/4 md:w-full'>
                    <LogSign props={['password', password_error]} />

                    {password_error !== null ?
                        <InputError props={password_error} />
                    :
                        null
                    }
                </div>

                <div className='flex flex-col items-start w-3/4 md:w-full'>
                    <LogSign props={['confirm', signErr.passConf]} />

                    {signErr.passConf !== null ?
                        <InputError props={signErr.passConf} /> 
                    :
                        null
                    }
                </div>
            </div>

            <div className='flex justify-around items-center font-semibold my-4 w-3/4 md:w-4/5'>
                <button type='button' className='text-slate-400 bg-white border border-slate-400 rounded-full 
                    w-2/5 md:w-1/4 hover:bg-gray-200'>
                    <Link to='/api/login'> Back to login </Link>
                </button>
                
                <button type='submit' className='cursor-pointer text-red-400 bg-white border border-red-400 rounded-full 
                    w-2/5 md:w-1/4 hover:bg-rose-200' 
                    onClick={() => signUp()}> 
                    Sign up 
                </button>
            </div>
        </div>
    )
}

export default Signup;