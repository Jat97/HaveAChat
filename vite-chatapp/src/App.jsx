import {BrowserRouter, Navigate, Routes, Route} from 'react-router-dom';
import {useChatStore} from './Context/ChatStore';
import Login from './Routes/Users/Profile/Login';
import Signup from './Routes/Users/Profile/Signup';
import Account from './Routes/Users/Profile/AccountTab';
import UserIndex from './Routes/Users/UserIndex';
import Chats from './Routes/Chats/Chats';
import PageError from './Routes/Errors/PageError';
import Unauthorized from './Routes/Miscellaneous/Popups/Unauthorized';

const App = () => {
    const site_error = useChatStore((state) => state.site_error);
    const account_tab = useChatStore((state) => state.account_tab);
    const unauthorized = useChatStore((state) => state.unauthorized);

    return (
        <div className={`${account_tab ? 'bg-slate-200/50' : ''}`}>
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
                    <Route path='/api/:username/chat' element={<Chats />}></Route>
                    <Route path='*' element={<Navigate to='/api/login' />}></Route>
                </Routes>
            </BrowserRouter>

            {site_error === null &&
                <PageError props={site_error} />
            }

            {unauthorized && 
                <Unauthorized />
            }
        </div>
    )
};

export default App;