import {useState} from 'react';
import {useChatStore} from '../../../Context/ChatStore';  
import LogSign from '../../Inputs/LogSign';
import PageError from '../../Errors/PageError';

const Signup = () => {
    const [signErr, setSignErr] = useState({
        display_name: null,
        email: null,
        dob: null,
        passConf: null
    });

    const usernameError = useChatStore((state) => state.usernameError);
    const passwordError = useChatStore((state) => state.passwordError);
    const setSiteError = useChatStore((state) => state.setSiteError);
    const setUsernameError = useChatStore((state) => state.setUsernameError);
    const setPasswordError = useChatStore((state) => state.setPasswordError);

    const signUp = () => {
        fetch('http://localhost:9000/api/signup', {
            method: 'POST',
            credentials: 'include'
        })
        .then(res => {
            if(res.redirect) {
                windlow.location = res.url.replace('9000', '3000');
            }
            else if(res.ok === false) {
                return res.json();
            }
            else {
                throw Error(`${res.status}: ${res.statusText}`);
            }
        })
        .then(json => {
            json.errors.forEach(error => {
                if(error.params) {
                    setUsernameError(error.msg);
                }
                else if(error.params === 'password') {
                    setPasswordError(error.msg);
                }
                else {
                    setSignErr(prevState => ({
                        ...prevState,
                        [error.params]: error.msg
                    }))
                }
            });
        })
        .catch(err => setSiteError(err.message))
    }

    return (
        <div>
            <p> Create your account </p>

            <div>
                <div>
                    <LogSign props={'username'} />

                    {usernameError !== null ?
                        <PageError props={usernameError} />
                    :
                        null
                    }
                </div>

                <div>
                    <LogSign props={'name'} />

                    {signErr.display_name !== null ?
                        <PageError props={signErr.display_name} />
                    :
                        null
                    }
                </div>
                
                <div>
                    <LogSign props={'email'} />

                    {signErr.email !== null ?
                        <PageError props={signErr.email} />
                    :
                        null
                    }
                </div>

                <div>
                    <LogSign props={'dob'} />

                    {signErr.dob !== null ?
                        <PageError props={signErr.dob} />
                    :
                        null
                    }
                </div>

                <div>
                    <LogSign props={'password'} />

                    {passwordError !== null ?
                        <PageError props={passwordError} />
                    :
                        null
                    }
                </div>

                <div>
                    <LogSign props={'confirm'} />

                    {signErr.passConf !== null ?
                        <PageError props={signErr.passConf} /> 
                    :
                        null
                    }
                </div>
            </div>

            <div>
                <button type='button' onClick={() => signUp()}>
                    Sign up
                </button>
            </div>
        </div>
    )
}

export default Signup;