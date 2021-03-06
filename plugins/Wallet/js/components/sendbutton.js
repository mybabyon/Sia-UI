import React, { PropTypes } from 'react'

const SendButton = ({currencytype, onClick}) => (
	<div onClick={onClick} className="send-button">
		<i className="fa fa-paper-plane fa-2x"></i>
		<span>Send {currencytype}</span>
	</div>
)

SendButton.propTypes = {
	currencytype: PropTypes.string.isRequired,
}

export default SendButton
