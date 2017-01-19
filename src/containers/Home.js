import React, { Component } from 'react'
import styles from '../styles/Generic.css'
import Loader from '../components/Loader'
import Tagline from '../components/Tagline'

export default class Home extends Component {

	constructor (props) {

		super(props);
		if(localStorage.getItem('parameters')){
			this.state = JSON.parse(localStorage.getItem('parameters'))
		}
		else {
			this.state = {
				amount : "",
				customer_phone : "",
				customer_email : "",
				customer_id : "",
				showLoader : false,
				errorOccured : null
			}
		}
	}

	componentWillMount = () => {
		this.setState({errorOccured: ''})
	}

	amountChange = (event) => {
		this.setState({amount:event.target.value})
	}

	mobileChange = (event) => {
		this.setState({customer_phone:event.target.value})
	}

	emailChange = (event) => {
		this.setState({customer_email:event.target.value})
	}

	customerIdChange = (event) => {
		this.setState({customer_id:event.target.value})
	}

	submitAmount = () => {
		this.setState({showLoader:true, errorOccured: null})
		if(!this.state.amount) {
			this.setState({showLoader:false, errorOccured: 'Please enter the amount of the order.'})
		} else {
			var orderId = '';
			var url = '#/order/:orderId/paymentmethods?amount='+this.state.amount.toString()+'&customerId='+this.state.customer_id
			localStorage.setItem('parameters', JSON.stringify(this.state));
			var params = JSON.parse(JSON.stringify(this.state))
			$.get('/order_create',params, function(data){
				var data = JSON.parse(data)
				orderId = JSON.parse(data.order).order_id
				console.log(orderId)
				if(orderId) {
					url = url.replace(':orderId',orderId)
					window.location.href = url;
				} else {
					this.setState({showLoader: false, errorOccured: 'Error while creating order. Please retry'})
				}
			}.bind(this));
		}
	}
	
  	render () {
  		var tagline = "Welcome to Juspay API demo ! Please create your order"
  		if(this.state.showLoader){
  			return(<div><Loader>Creating Order. Please Wait...</Loader></div>);
  		}
	   	return (
	      <div>
	      		<Tagline message={tagline} />
				<div className={styles.order}>
					<div className={styles.inputBlock} style={{color: "red", marginBottom: "20px"}}>
						{this.state.errorOccured}
					</div>
					<div className={styles.inputBlock}>
	                    <input autoFocus required id="amount" name="amount"
	                      className={styles.input} type="tel" onChange={this.amountChange} value={this.state.amount}/>
	                    <div className={styles.label}>Amount</div>
	                </div>
	                <div className={styles.inputBlock}>
	                    <input required className={styles.input} type="tel" onChange={this.mobileChange} value={this.state.customer_phone}/>
	                    <div className={styles.label}>Mobile Number</div>
	                </div>
	                <div className={styles.inputBlock}>
	                    <input required className={styles.input} type="tel" onChange={this.emailChange} value={this.state.customer_email}/>
	                    <div className={styles.label}>Email</div>
	                </div>
	                <div className={styles.inputBlock}>
	                    <input required className={styles.input} type="tel" onChange={this.customerIdChange} value={this.state.customer_id}/>
	                    <div className={styles.label}>Customer Id</div>
	                </div>
                	<button className={styles.btnPri} onClick={this.submitAmount}>Continue</button>
	                <div style={{marginTop: "20px"}}></div>
	        	</div>
        	</div>
	    );
  	}
}