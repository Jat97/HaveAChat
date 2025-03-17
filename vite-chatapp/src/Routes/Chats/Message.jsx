const Message = (props) => {
    const message = props.props[0];
    const user = props.props[1];

    return (
        <p> {message} </p>
    )
}

export default Message;