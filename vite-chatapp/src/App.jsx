import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {QueryClient} from '@tanstack/react-query';
import {chatStore} from './Context/ChatStore';
import Login from './Routes/Users/Profile/Login';
import Signup from './Routes/Users/Profile/Signup';
import Account from './Routes/Users/Profile/Account';
import UserIndex from './Routes/Users/UserIndex';
import Chats from './Routes/Chats/Chats';
import UserChat from './Routes/Chats/UserChat';
import PageError from './Routes/Errors/PageError';

export const queryClient = new QueryClient();

export const App = () => {
    const {siteError} = ((state) => ({
      siteError: state.siteError  
    }));

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path='/api/login' element={<Login />}></Route>
                    <Route path='/api/signup' element={<Signup />}></Route>
                    <Route path='/api/account' element={<Account />}></Route>
                    <Route path='/api/search' element={<UserIndex />}></Route>
                    <Route path='/api/index' element={<UserIndex />}></Route>
                    <Route path='/api/friends' element={<UserIndex />}></Route>
                    <Route path='/api/blocked' element={<UserIndex />}></Route>
                    <Route path='/api/chats' element={<Chats />}></Route>
                    <Route path='/api/:username/chat' element={<UserChat />}></Route>
                </Routes>
            </BrowserRouter>

            {siteError === null ?
                null
            :
                <PageError props={siteError} />
            }
        </div>
    )
};

export default App;