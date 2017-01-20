from flask import Flask, render_template, request, redirect
import os
import json
import juspay
from juspay import config
from juspay import util
import random
import time

app = Flask(__name__)
app.config['DEBUG'] = True

#add api key
merchant_id = 'ec_demo'
config.environment = 'sandbox'
config.api_key = '3E69335A241F49DFAE9C023BAB73D312'

def getCustomerId(): 
	return "C" + str(random.randint(1000000,9999999))

@app.route("/",defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
	return render_template('index.html')

@app.route("/handle_payment")
def success():
	order_id = request.args.get('order_id')
	status = request.args.get('status')
	return redirect('#/handlepayment?orderId='+order_id+'&status='+status)

@app.route("/order_create")
def create_order():
	amount = request.args.get('amount')
	order_id = "O" + str(random.randint(1000000,9999999))
	cust_id = getCustomerId()
	if request.args.get('customer_id'):
		cust_id = request.args.get('customer_id')
	try:
		params = {
		'order_id' : order_id,
		'amount' : float(amount),
		'customer_id' : cust_id,
		'customer_phone' : request.args.get('customer_phone'),
		'customer_email' : request.args.get('customer_email'),
		'return_url' : 'https://ec-sdk-demo.herokuapp.com/handle_payment'
		}
		order = juspay.Orders.create(**params)
		order = json.dumps(vars(order))
	except Exception as e:
		errorMsg = "Error while creating order"
		print errorMsg, e
		order = json.dumps({'Error' : errorMsg})
	return json.dumps({'order' : order})

@app.route("/order_status")
def order_status():
	order_id = request.args.get('order_id')
	try:
		order_status = juspay.Orders.status(order_id = order_id)
		order_status = vars(order_status)
		amount = str(order_status['amount'])
		customer_id = str(order_status['customer_id'])
		return json.dumps({'amount' : amount, 'customerId' : customer_id})
	except Exception as e:
		errorMsg = "Error while getting order status for orderId : %s ." % order_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/list_cards")
def list_cards():
	cust_id = getCustomerId()
	if request.args.get('customer_id'):
		cust_id = request.args.get('customer_id')
	try:
		cards = juspay.Cards.list(customer_id = cust_id)
		cards = map(lambda card : json.dumps(vars(card)), cards)
		return json.dumps({'cards':cards})
	except Exception as e:
		errorMsg = "Error while retrieving saved cards for customerId %s . " % cust_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/delete_card")
def delete_card():
	card_token = request.args.get('card_token')
	try:
		card = juspay.Cards.delete(card_token = card_token)
		return json.dumps({'card':vars(card)})
	except Exception as e:
		errorMsg = "Error while deleting saved card %s ." % card_token
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/list_wallets")
def list_wallets():
	if request.args.get('customer_id'):
		customer_id = request.args.get('customer_id')
		url = '/customers/' + customer_id + '/wallets'
		try:
			response = util.request('GET', url, {}).json()
			print response, response['list']
			return json.dumps({'wallets' : response['list']})
		except Exception as e:
			errorMsg = "Error while getting wallets for customer %s" % customer_id
			print errorMsg, e.message
			if "[customer] cannot be null" in e.message:
				return json.dumps({'Error' : 'Invalid Customer'})
			else:
				return json.dumps({'Error' : errorMsg})
	else:
		return json.dumps({'Error' : 'Invalid Customer'})

@app.route("/create_customer")
def create_customer():
	customer_id = request.args.get('customerId')
	customer_email = request.args.get('customerEmail')
	customer_phone = request.args.get('customerPhone')
	customer_name = request.args.get('customerName')
	params = {
	"object_reference_id" : customer_id,
	"mobile_number" : customer_phone,
	"email_address" : customer_email,
	"first_name" : customer_name if customer_name else "fname",
	"last_name" : customer_name if customer_name else "lname"
	}
	try:
		customer = juspay.Customers.create(**params)
		customer = json.dumps(vars(customer))
		print customer
	except Exception as e:
		errorMsg = 'Error while creating customer'
		print errorMsg, e
		customer = json.dumps({'Error' : errorMsg})
	return json.dumps({'customer' : customer})

@app.route("/create_wallet")
def create_wallet():
	customer_id = request.args.get('customer_id')
	if not customer_id:
		return json.dumps({'Error' : 'Invalid Customer'}) 
	wallet = request.args.get('wallet')
	params = {
	'gateway' : wallet
	}
	url = '/customers/' + customer_id + '/wallets'
	try:
		response = util.request('POST', url, params).json()
		print response
		return json.dumps(response)
	except Exception as e:
		errorMsg = "Error while creating wallet for customer %s" % customer_id
		print errorMsg, e
		if "Input customerId is invalid" in e.message:
			return json.dumps({'Error' : 'Invalid Customer'})
		else:
			return json.dumps({'Error' : errorMsg})

@app.route("/authenticate_wallet")
def authenticate_wallet():
	wallet_id = request.args.get('wallet_id')
	params = {
	'command' : 'authenticate'
	}
	url = '/wallets/' + wallet_id
	try :
		response = util.request('POST', url, params).json()
		print response
		return json.dumps(response)
	except Exception as e:
		errorMsg = "Error while authenticating wallet : %s" % wallet_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/link_wallet")
def link_wallet():
	wallet_id = request.args.get('wallet_id')
	otp = request.args.get('otp')
	params = {
	'command' : 'link',
	'otp' : otp
	}
	url = '/wallets/' + wallet_id
	try:
		response = util.request('POST', url, params).json()
		print response
		return json.dumps(response)
	except Exception as e:
		errorMsg = "Error while linking wallet %s" % wallet_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/delink_wallet")
def delink_wallet():
	wallet_id = request.args.get('wallet_id')
	params = {
	'command' : 'delink'
	}
	url = '/wallets/' + wallet_id
	try:
		response = util.request('POST', url, params).json()
		print response
		return json.dumps(response)
	except Exception as e:
		errorMsg = "Error while delinking wallet %s" % wallet_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/refresh_wallet")
def refresh_wallet():
	wallet_id = request.args.get('wallet_id')
	params = {
	'command' : 'refresh'
	}
	url = '/wallets/' + wallet_id
	try:
		response = util.request('POST', url, params).json()
		print response
		return json.dumps(response)
	except Exception as e:
		errorMsg = "Error while refreshing wallet %s" %wallet_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/create_txn")
def create_txn():
	payment_method_type = request.args.get('payment_method_type')
	params = {
	'order_id' : request.args.get('order_id'),
	'merchant_id' : merchant_id,
	'redirect_after_payment' : (request.args.get('redirect_after_payment') ==  "true")
	}
	errorMsg = 'Error occured during Transaction for orderId - %s. ' % (request.args.get('order_id'))
	if payment_method_type == 'NB':
		params['payment_method'] = request.args.get('payment_method')
		try:
			response = juspay.Payments.create_net_banking_payment(**params)
			return json.dumps(vars(response.payment.authentication))
		except Exception as e:
			print errorMsg, e
	elif payment_method_type == 'WALLET':
		params['payment_method'] = request.args.get('payment_method')
		if(request.args.get('direct_wallet_token')):
			params['direct_wallet_token'] = request.args.get('direct_wallet_token')
		try:
			response = juspay.Payments.create_wallet_payment(**params)
			return json.dumps(vars(response.payment.authentication))
		except Exception as e:
			print errorMsg, e
	elif payment_method_type == 'CARD':
		card_token = request.args.get('card_token')
		params['save_to_locker'] = (request.args.get('save_to_locker') == "true")
		params['card_security_code'] = request.args.get('card_security_code')
		if card_token:
			params['card_token'] = card_token
			try:
				response = juspay.Payments.create_card_payment(**params)
			except Exception as e:
				print errorMsg, e
		else:
			params['card_number'] = request.args.get('card_number')
			params['name_on_card'] = request.args.get('name_on_card')
			params['card_exp_month'] = request.args.get('card_exp_month')
			params['card_exp_year'] = request.args.get('card_exp_year')
			try:
				response = juspay.Payments.create_card_payment(**params)
			except Exception as e:
				print errorMsg, e
		return json.dumps(vars(response.payment.authentication))
	else:
		errorMsg += 'Payment Method Type not available'
		print errorMsg
	return json.dumps({'Error' : errorMsg})


port = int(os.environ.get('PORT', 5000))
if __name__ == "__main__":
    app.run(port=port)