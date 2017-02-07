import React, { Component } from 'react'
import styles from '../styles/Generic.css'
import Tagline from '../components/Tagline'
import logo from '../components/JuspayLogo'
import Loader from '../components/Loader'

var popupAttrs = "height=440,width=800,left=200,top=150,location=1,status=1,scrollbars=1,screenX=200"

export default class NetBanking extends Component {

	constructor(props) {
		super(props);
		this.state = {
			showLoader: true,
			banks : []
		}
	}

	componentDidMount = () => {
		$.get('/payment_methods', {}, (data) => {
			var payment_methods = JSON.parse(data).payment_methods;
			var banks = []
			payment_methods.forEach((payment_method) => {
				if(payment_method.payment_method_type == "NB") {
					banks.push({
						payment_method : payment_method.payment_method,
						description : payment_method.description
					})
				}
			})
			this.setState({showLoader: false, banks: banks})
		})
	}

	handlePayment = (e) => {
		e.preventDefault();
		var sec_window = window.open("", "_blank", popupAttrs)
		sec_window.document.write(logo)
		var payment_method = document.getElementById("payment_method").value
		var params = {
		"order_id" : this.props.routeParams.orderId,
		"payment_method_type" : "NB",
		"payment_method" : payment_method,
		"redirect_after_payment" : "true"
		}
		$.get('/create_txn',params, function(data){
			var data = JSON.parse(data)
			if(data.url){
				sec_window.location.replace(data.url)
			} else {
				var url = "/handle_payment?order_id=" + this.props.routeParams.orderId + "&status=FAILED"
				sec_window.location.replace(url)
			}
		}.bind(this));

	}

	render (){

		if(this.state.showLoader) {
  			return (<div><Loader>Fetching enabled banks. Please Wait...</Loader></div>)
  		}

  		var banks = this.state.banks

  		var amount = this.props.location.query.amount
		var tagline =  'Select your bank to proceed. Total amount payable: \u20b9 ' + amount.toString()
		return(
			<div>
				<Tagline message={tagline} />
                <div className="form-group">
    				<select id="payment_method" className="form-control" style={{width: '100%', marginTop: '20px', marginBottom: '20px'}} defaultValue="Select Bank">
    	            	<option value="SB" noselect>Select Bank</option>
                        <option disabled>----</option>
    	            	{() => {
	                       return banks.map((item) => {
	                       	return <option key={item.payment_method} value={item.payment_method}>{item.description}</option>
	                       })
	                      }()}
    	            </select>
                </div>
				<button type="submit" className={styles.btnPri} onClick={this.handlePayment}>Continue</button>
			</div>

		);
	}
}