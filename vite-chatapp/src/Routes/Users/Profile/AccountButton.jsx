import {Bars4Icon, UserIcon} from '@heroicons/react/24/solid';
import {useChatStore} from '../../../Context/ChatStore';
import AccountTab from './AccountTab';

const AccountButton = () => {
    const account_tab = useChatStore((state) => state.account_tab);
    const setAccountTab = useChatStore((state) => state.setAccountTab);

    const toggleTab = () => {
        setAccountTab();
    }

    return (
        <div>
            <button type='button' data-testid='account_button' onClick={setAccountTab}>
                <UserIcon className='h-8' />
            </button>
            
            {account_tab &&
                <AccountTab props={toggleTab} />
            }
        </div>  
    )
}

export default AccountButton;