import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Message = (props) => {
    const message = props.props[0];
    const is_logged = props.props[1];

    return (
        <div className={`flex flex-col my-2 ${is_logged ? 'items-end mr-5' : 'items-start ml-5'}`}>
            {message.image ? 
                <div>
                    <img src={message.image} className={`rounded-tl-xl rounded-tr-xl my-2 max-h-[200px] max-w-[200px] 
                        ${is_logged ? 'rounded-bl-xl rounded-br-xs' : 'rounded-bl-xs rounded-br-xl'}`}>    
                    </img>
                </div>
            :
                null
            }

           <div className={`flex flex-col text-pretty rounded-tl-xl rounded-tr-xl p-2 max-w-1/2 ${is_logged ? 
                    'items-end bg-amber-300 rounded-bl-xl rounded-br-xs' 
                : 
                    'items-start bg-gray-200 rounded-bl-xs rounded-br-xl'}`}>

                <p> 
                    {message.text} 
                </p>   
            </div>
            
            <p className='text-xs text-slate-200'> {dayjs().to(message.sent)} </p> 
        </div>
    )
}

export default Message;