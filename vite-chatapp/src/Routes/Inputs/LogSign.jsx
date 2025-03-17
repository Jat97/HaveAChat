const LogSign = (props) => {
    const typeid = props.props;

    return (
        <div> {typeid}
            <input id={typeid} data-testid={typeid} type={typeid} placeholder={`Enter your ${typeid} here.`} 
                min={typeid === 'password' ? '8' : null} max={'20'}>
            </input>
        </div>
    )
}

export default LogSign;