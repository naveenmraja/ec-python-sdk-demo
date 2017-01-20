import React, { Component } from 'react'
import styles from '../styles/Generic.css'
import '../styles/Loader.css'
import Tagline from '../components/Tagline'
import logo from '../components/JuspayLogo'
import Loader from '../components/Loader'
import paytmLogo from "../static/img/paytm.png"
import freechargeLogo from "../static/img/freecharge.png"
import mobikwikLogo from "../static/img/mobikwik.png"
import classNames from 'classnames'
import {Button,Modal,Well} from 'react-bootstrap'


var wallet_list = ["Loading"];
var popupAttrs = "height=440,width=800,left=200,top=150,location=1,status=1,scrollbars=1,screenX=200"

class CreateDispOptions extends Component {

	constructor(props) {
		super(props)
		this.state = {
			showLoader : false
		}
	}

	createWallet = () => {
		this.setState({showLoader: true});
		$.get('/create_wallet',{"customer_id" : this.props.customerId, "wallet" : this.props.wallet}, function(data){
			var wallet = JSON.parse(data)
			if(wallet.id){
				var newWallet = {}
				newWallet[wallet.wallet] = wallet
				this.setState({showLoader: false})
				this.props.setWalletState(newWallet)
			} else {
				this.setState({showLoader: false})
			}
		}.bind(this));
	}

	render () {

		if(this.state.showLoader) {
			return(
				<span style={{marginLeft: "10px"}}><img id='juspay-logo' src='https://d3oxf4lkkqx2kx.cloudfront.net/images/juspay-logo-v2-64x64.png' style={{width: "20px", height: "20px",  marginTop: "-5px"}}/></span>
				)
		}

		return (
			<span>
				<button className={styles.btnLink} onClick={this.createWallet}>Create Wallet</button>
			</span>
			)
	}
}

class DelinkDispOptions extends Component {

	constructor(props) {
		super(props)
		this.state = {
			showLoader : false,
			delinked : false,
			walletObject: this.props.walletObject
		}
	}

	delinkWallet = () => {
		this.setState({showLoader: true, delinked: false})
		var walletObject = this.state.walletObject
		$.get('/delink_wallet',{"wallet_id" : walletObject.id}, function(data){
			var wallet = JSON.parse(data)
			if(!wallet.linked){
				var newWallet = {}
				newWallet[wallet.wallet] = wallet
				this.setState({showLoader: false, delinked: true, walletObject: wallet})
				this.props.setWalletState(newWallet)
			} else {
				this.setState({showLoader: false, delinked: false})
			}
		}.bind(this));
	}

	refreshBalance = () => {
		this.setState({showLoader: true})
		var walletObject = this.state.walletObject
		$.get('/refresh_wallet',{"wallet_id" : walletObject.id}, function(data){
			var wallet = JSON.parse(data)
			if(wallet.id){
				var newWallet = {}
				newWallet[wallet.wallet] = wallet
				this.setState({showLoader: false, delinked: false, walletObject: wallet})
				this.props.setWalletState(newWallet)
			} else {
				this.setState({showLoader: false, delinked: false})
			}
		}.bind(this));
	}

	render () {
		if(this.state.showLoader) {
			return(
				<span style={{marginLeft: "10px"}}><img id='juspay-logo' src='https://d3oxf4lkkqx2kx.cloudfront.net/images/juspay-logo-v2-64x64.png' style={{width: "20px", height: "20px",  marginTop: "-5px"}}/></span>
				)
		}
		if(this.state.delinked) {
			return(
				<span>
				<LinkDispOptions walletObject={this.state.walletObject} setWalletState={this.props.setWalletState} />
				</span>
				)
		}
		var walletBalance = this.state.walletObject.current_balance;
		if(!walletBalance) {
			walletBalance = 0
		}
		return (
			<span> 
				<label className={styles.text} style={{color: '#62BF5D', fontSize: '15px', marginLeft: '-10px'}}>&#8377;{walletBalance}</label>
				<a className={styles.btnRefresh} onClick={this.refreshBalance}><span className="glyphicon glyphicon-refresh"></span></a>
				<button className={styles.btnDelink} onClick={this.delinkWallet}>Delink Wallet</button>
			</span>
			)
	}
}

class LinkDispOptions extends Component {

	constructor(props) {
		super(props)
		this.state = {
			showModal : false,
			otp : '',
			showLoader: false,
			retryOtp: false,
			linked: false,
			walletObject: this.props.walletObject
		}
	}

	otpChange = (event) => {
		this.setState({otp:event.target.value})
	}

	authenticateWallet = () => {
		this.setState({showLoader: true});
		var walletObject = this.state.walletObject
		$.get('/authenticate_wallet',{"wallet_id" : walletObject.id}, function(data){
			var wallet = JSON.parse(data)
			if(wallet.id){
				var newWallet = {}
				newWallet[wallet.wallet] = wallet
				this.setState({showLoader: false, showModal: true, otp: '', retryOtp: false, walletObject: wallet})
				this.props.setWalletState(newWallet)
			} else {
				this.setState({showLoader: false, otp: '', retryOtp: false})
			}
		}.bind(this));
	}

	linkWallet = () => {
		this.setState({showModal: false, showLoader: true})
		var otp = this.state.otp
		var walletObject = this.state.walletObject
		$.get('/link_wallet',{"wallet_id" : walletObject.id, "otp": otp}, function(data){
			var wallet = JSON.parse(data)
			if(wallet.linked){
				var newWallet = {}
				newWallet[wallet.wallet] = wallet
				this.setState({showLoader: false, showModal: false, linked: true})
				this.props.setWalletState(newWallet)
			} else {
				this.setState({showLoader: false, showModal: true, retryOtp: true, linked: false})
			}
		}.bind(this));
	}

	closeModal = () => {
		this.setState({showLoader: false, showModal: false, retryOtp: false, otp: ''})
	}

	render() {
		if(this.state.linked) {
			return(
				<span>
					<DelinkDispOptions walletObject={this.state.walletObject}  setWalletState={this.props.setWalletState} />
				</span>
				)
		}
		if(this.state.showLoader) {
			return(
				<span style={{marginLeft: "10px"}}><img id='juspay-logo' src='https://d3oxf4lkkqx2kx.cloudfront.net/images/juspay-logo-v2-64x64.png' style={{width: "20px", height: "20px",  marginTop: "-5px"}}/></span>
				)
		}
		var tagline = "OTP sent to the registered mobile. Please enter it to authenticate your wallet"
		var retryOtp = ""
		if(this.state.retryOtp) {
			retryOtp = "OTP entered is wrong. Please retry"
		}
		return (
			<span>
				<button className={styles.btnLink} onClick={this.authenticateWallet}>Link Wallet</button>
				<div>
					<Modal show={this.state.showModal} onHide={this.closeModal}>
						<Modal.Header closeButton>
							<Modal.Title>Authenticate Wallet</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Tagline message={tagline} />
							<div className={styles.inputBlock} style={{color: "red", marginBottom: "20px", marginTop: "20px"}}>
								{retryOtp}
							</div>
							<div className={styles.inputBlock} style={{marginTop: "20px"}}>
		                    <input required autoFocus id="otp" name="otp"
		                      className={styles.input} type="tel" onChange={this.otpChange} value={this.state.otp}/>
		                    <div className={styles.label}>OTP</div>
		                    <button className={styles.btnPri} onClick={this.linkWallet}>Continue</button>
		                </div>
						</Modal.Body>
						<Modal.Footer>
							<Button onClick={this.closeModal}>Close</Button>
						</Modal.Footer>
					</Modal>
				</div>
			</span>
			)
	}
}

class CreateCustomer extends Component {
	constructor(props) {
		super(props)
		this.state = {
			showModal: false,
			customerId: '',
			customerEmail : '',
			customerPhone : '',
			customerName : '',
			validationError : null
		}
	}

	createCustomer = () => {
		var validationError = null
		if(this.state.customerId.length < 8) {
			validationError = 'Customer id should not be less than 8 characters.'
		} else if(!this.state.customerPhone) {
			validationError = 'Please enter the customer phone number'
		} else if(!this.state.customerEmail) {
			validationError = 'Please enter the customer email id'
		}
		if(validationError) {
			this.setState({validationError: validationError})
		} else {
			var newObj = {}
			newObj['showLoader'] = true
			newObj['loaderTag'] = 'Creating Customer and creating a new order. Please Wait ...'
			this.props.setWalletState(newObj)
			this.setState({showModal: false})
			var params = JSON.parse(JSON.stringify(this.state))
			$.get('/create_customer',params, function(data){
				var customer = JSON.parse(data).customer
				var juspayCustomerId = JSON.parse(customer).id
				newObj['showLoader'] = false
				newObj['loaderTag'] = ''
				if(juspayCustomerId) {
					newObj['invalidCustomer'] = false
					newObj['customerId'] = this.state.customerId
					var orderParams = {
						"amount" : this.props.amount,
						"customer_id" : this.state.customerId,
						"customer_phone" : this.state.customerPhone
					}
					$.get('/order_create',orderParams, function(data){
							var data = JSON.parse(data)
							var orderId = JSON.parse(data.order).order_id
							if(orderId) {
								newObj['orderId'] = orderId
								this.props.setWalletState(newObj)
							} else {
								newObj['invalidCustomer'] = true
								this.props.setWalletState(newObj)
							}
						}.bind(this));
				} else {
					newObj['invalidCustomer'] = true
					this.props.setWalletState(newObj)
				}
			}.bind(this));
		}
	}

	customerIdChange = (event) => {
		this.setState({customerId:event.target.value})
	}

	customerEmailChange = (event) => {
		this.setState({customerEmail:event.target.value})
	}

	customerPhoneChange = (event) => {
		this.setState({customerPhone:event.target.value})
	}

	customerNameChange = (event) => {
		this.setState({customerName:event.target.value})
	}

	openModal = () => {
		this.setState({showModal: true, customerId: '', customerEmail: '', customerPhone: '', customerName: '', validationError: null})
	}

	closeModal = () => {
		this.setState({showModal: false, customerId: '', customerEmail: '', customerPhone: '', customerName: '', validationError: null})
	}

	render () {
		var tagline = "Please Enter the details of the customer"
		return(
			<div>
				<Well bsSize="small">Customer not created. Please <a onClick={this.openModal} style={{cursor: 'pointer'}}>Click here</a> to create customer</Well>
				<Modal show={this.state.showModal} onHide={this.closeModal}>
					<Modal.Header closeButton>
						<Modal.Title>Create Customer</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Tagline message={tagline} />
						<div className={styles.inputBlock} style={{color: "red", marginBottom: "20px", marginTop: "20px"}}>
							{this.state.validationError}
						</div>
						<div className={styles.inputBlock} style={{marginTop: "20px"}}>
		                    <input required autoFocus id="customerId" name="customerId"
		                      className={styles.input} type="text" onChange={this.customerIdChange} value={this.state.customerId}/>
		                    <div className={styles.label}>Customer Id</div>
	                	</div>
	                	<div className={styles.inputBlock}>
		                    <input required id="customerPhone" name="customerPhone"
		                      className={styles.input} type="tel" onChange={this.customerPhoneChange} value={this.state.customerPhone}/>
		                    <div className={styles.label}>Mobile Number</div>
	                	</div>
	                	<div className={styles.inputBlock}>
		                    <input required id="customerEmail" name="customerEmail"
		                      className={styles.input} type="text" onChange={this.customerEmailChange} value={this.state.customerEmail}/>
		                    <div className={styles.label}>Email id</div>
	                	</div>
	                	<div className={styles.inputBlock}>
		                    <input required id="customerName" name="customerName"
		                      className={styles.input} type="text" onChange={this.customerNameChange} value={this.state.customerName}/>
		                    <div className={styles.label}>Name</div>
	                	</div>
	                	<button className={styles.btnPri} onClick={this.createCustomer}>Continue</button>
	                	<div style={{marginTop: "20px"}}></div>
					</Modal.Body>
				</Modal>
			</div>
			)
	}
}

class NormalWallet extends Component {

	handlePayment = (e) => {
		e.preventDefault();
		var sec_window = window.open("", "_blank", popupAttrs)
		sec_window.document.write(logo)
		var payment_method = document.querySelector('input[name="walletsRadio"]:checked').value		
		var params = {
			"order_id" : this.props.orderId,
			"payment_method_type" : "WALLET",
			"payment_method" : payment_method,
			"redirect_after_payment" : "true"
		};
		$.get('/create_txn',params, function(data){
			var data = JSON.parse(data)
			if(data.url){
				sec_window.location.replace(data.url)
			} else {
				var url = "/handle_payment?order_id=" + this.props.orderId + "&status=FAILED"
				sec_window.location.replace(url)
			}
		}.bind(this));
	}

	render () {
  		var radioClass = classNames('radio', styles.radioMargin)
  		return(
			<div>
				<div className={radioClass}>
					<label className={styles.text}><input type="radio" name="walletsRadio" value="FREECHARGE"><img src={freechargeLogo} style={{height: "35px", width: "100px", marginTop: "-5px"}} /></input></label>
				</div>
				<div className={radioClass}>
					<label className={styles.text}><input type="radio" name="walletsRadio" value="MOBIKWIK"><img src={mobikwikLogo} style={{height: "35px", width: "100px", marginTop: "-5px"}} /></input></label>
				</div>
				<div className={radioClass}>
					<label className={styles.text}><input type="radio" name="walletsRadio" value="PAYTM"><img src={paytmLogo} style={{height: "35px", width: "100px", marginTop: "-5px"}} /></input></label>
				</div>
				<div className="form-group">
				    	<button type="submit" className={styles.btnPri} onClick={this.handlePayment}>Continue</button>
				</div>
			</div>
			)
  	}
}

class DirectDebit extends Component {

	constructor(props) {
		super(props);
		this.state = {
			PAYTM : null,
			FREECHARGE : null,
			MOBIKWIK : null,
			showLoader: true,
			invalidCustomer: false,
			customerId: null,
			orderId: this.props.orderId,
			loaderTag : 'Fetching Wallets. Please Wait...'
		}
	}

	componentWillMount = () => {
		var newObj = {}
		newObj['showLoader'] = false
		var customerId = this.props.customerId;
		newObj['customerId'] = customerId
		$.get('/list_wallets', {"customer_id": customerId}, function(data){
			var response = JSON.parse(data)
			var walletsList = response.wallets;
			if(walletsList && walletsList.length>0){
				walletsList.forEach(function(w){
					newObj[w.wallet] = w
				});
			} else if(response.Error && response.Error.includes('Invalid Customer')) {
				newObj['invalidCustomer'] = true
			}
			this.setState(newObj);
		}.bind(this));
	}

	setWalletState = (stateObj) => {
		this.setState(stateObj)
	}

	handlePayment = (e) => {
		e.preventDefault();
		var sec_window = window.open("", "_blank", popupAttrs)
		sec_window.document.write(logo)
		var payment_method = document.querySelector('input[name="directWalletsRadio"]:checked').value
		var wallet = this.state[payment_method]
		var params = {
			"order_id" : this.state.orderId ? this.state.orderId : this.props.orderId,
			"payment_method_type" : "WALLET",
			"payment_method" : payment_method,
			"redirect_after_payment" : "true"
		};
		if(wallet) {
			params["direct_wallet_token"] = wallet.token;
		}
		$.get('/create_txn',params, function(data){
			var data = JSON.parse(data)
			if(data.url){
				sec_window.location.replace(data.url)
			} else {
				var url = "/handle_payment?order_id=" + this.state.orderId + "&status=FAILED"
				sec_window.location.replace(url)
			}
		}.bind(this));
	}
	
  	render () {
  		if(this.state.showLoader) {
  			return (<div><Loader>{this.state.loaderTag}</Loader></div>)
  		}

  		var mobikwikDispOptions = ''
  		var freechargeDispOptions = ''
  		var paytmDispOptions = ''

  		var invalidCustomer = null

  		if(this.state.invalidCustomer) {
  			invalidCustomer = <CreateCustomer setWalletState={this.setWalletState} amount={this.props.amount}/>
  		} else {
  			if(this.state.FREECHARGE) {
	  			if(this.state.FREECHARGE.linked) {
	  				freechargeDispOptions = <DelinkDispOptions walletObject={this.state.FREECHARGE} setWalletState={this.setWalletState} />
	  			} else {
	  				freechargeDispOptions = <LinkDispOptions walletObject={this.state.FREECHARGE} setWalletState={this.setWalletState} />
	  			}
	  		} else {
	  			freechargeDispOptions = <CreateDispOptions customerId={this.state.customerId} wallet="FREECHARGE" setWalletState={this.setWalletState} />
	  		}

	  		if(this.state.MOBIKWIK) {
	  			if(this.state.MOBIKWIK.linked) {
	  				mobikwikDispOptions = <DelinkDispOptions walletObject={this.state.MOBIKWIK}  setWalletState={this.setWalletState} />
	  			} else {
	  				mobikwikDispOptions = <LinkDispOptions walletObject={this.state.MOBIKWIK} setWalletState={this.setWalletState} />
	  			}
	  		} else {
	  			mobikwikDispOptions = <CreateDispOptions customerId={this.state.customerId} wallet="MOBIKWIK" setWalletState={this.setWalletState} />
	  		}

	  		if(this.state.PAYTM) {
	  			if(this.state.PAYTM.linked) {
	  				paytmDispOptions = <DelinkDispOptions walletObject={this.state.PAYTM}  setWalletState={this.setWalletState} />
	  			} else {
	  				paytmDispOptions = <LinkDispOptions walletObject={this.state.PAYTM} setWalletState={this.setWalletState} />
	  			}
	  		} else {
	  			paytmDispOptions = <CreateDispOptions customerId={this.state.customerId} wallet="PAYTM" setWalletState={this.setWalletState} />
	  		}
  		}

  		var radioClass = classNames('radio', styles.radioMargin)
  		return(
			<div>
				{invalidCustomer}
				<div className={radioClass}>
					<label className={styles.text}><input type="radio" disabled={this.state.invalidCustomer} name="directWalletsRadio" value="FREECHARGE"><img src={freechargeLogo} style={{height: "35px", width: "100px", marginTop: "-5px"}} /></input></label>{freechargeDispOptions}
				</div>
				<div className={radioClass}>
					<label className={styles.text}><input type="radio" disabled={this.state.invalidCustomer} name="directWalletsRadio" value="MOBIKWIK"><img src={mobikwikLogo} style={{height: "35px", width: "100px", marginTop: "-5px"}} /></input></label>{mobikwikDispOptions}
				</div>
				<div className={radioClass}>
					<label className={styles.text}><input type="radio" disabled={this.state.invalidCustomer} name="directWalletsRadio" value="PAYTM"><img src={paytmLogo} style={{height: "35px", width: "100px", marginTop: "-5px"}} /></input></label>{paytmDispOptions}
				</div>
				<div className="form-group">
				    	<button type="submit" className={styles.btnPri} disabled={this.state.invalidCustomer} onClick={this.handlePayment}>Continue</button>
				</div>
			</div>
			)
  	}
}

class Tabs extends Component {

	render () {
		return(		
			<ul className="nav nav-tabs">
				<li className="active">
					<a href="#normal" aria-controls="normal" data-toggle="tab">
						Wallet Payment
					</a>
				</li>
				<li>
					<a href="#directdebit" aria-controls="directdebit" data-toggle="tab">
						Wallet Direct Debit
					</a>
				</li>
			</ul>
			);
	}
}

class TabContent extends Component {

	render () {	
		return (
				<div className="tab-content">
					<div role="tabpanel" className="tab-pane fade in active" id="normal">
						<NormalWallet orderId={this.props.orderId}/>
					</div>
					<div role="tabpanel" className="tab-pane fade" id="directdebit">
						<DirectDebit customerId={this.props.customerId} orderId={this.props.orderId} amount={this.props.amount}/>
					</div>
				</div>
			);
	}
}

export default class WalletPayment extends Component {
	
  	render () {
  		var customerId = this.props.location.query.customerId
  		var amount = this.props.location.query.amount
  		var orderId = this.props.routeParams.orderId
		var tagline =  'Select your wallet to proceed. Total amount payable: \u20b9 ' + amount.toString()
  		return(
			<div>
				<Tagline message={tagline} />
				<Tabs />
				<TabContent customerId={customerId} orderId={orderId} amount={amount}/>
			</div>
			)
  	}
}