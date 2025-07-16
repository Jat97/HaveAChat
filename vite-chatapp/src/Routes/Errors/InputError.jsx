const InputErr = (props) => {
    const error = props.props;

    return (
        <p className='text-xs text-red-400'> {error} </p>
    )
}

export default InputErr;