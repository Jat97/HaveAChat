import {useChatStore} from '../../../Context/ChatStore';
import {Link} from 'react-router-dom';
import LogSign from '../../Inputs/LogSign';
import PageError from '../../Errors/PageError';

const Login = () => {
    const usernameError = useChatStore((state) => state.usernameError);
    const passwordError = useChatStore((state) => state.passwordError);
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
            if(res.redirect) {
                window.location = res.url.replace('9000', '3000');
            }
            else if(res.ok === false) {
                return res.json();
            }
            else {
                throw Error(`${res.status}: ${res.statusText}`);
            }
        })
        .then(json => {
            setUsernameError(json.user_err !== undefined ? json.user_err : null);
            setPasswordError(json.pass_err !== undefined ? json.pass_err : null);
        })
        .catch(err => setSiteError(err.message))
    }

    return (
        <div>
            <p> Log in and start chatting </p>
            
            <div>
                <div>
                    <LogSign props={'user'} />

                    {usernameError !== null ? 
                        <PageError props={usernameError} />
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
            </div>

            <div>
                <button type='button' onClick={() => logIn()}> Log in </button>
                <p> Don't have an account? <Link to='/api/signup'> Create one! </Link> </p>
            </div>
        </div>
    )
}

export default Login;