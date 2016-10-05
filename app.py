from flask import Flask, render_template, request, redirect
import os
import json
import juspay
from juspay import config
import random

app = Flask(__name__)
app.config['DEBUG'] = True

#add api key
card_api_key = '6BCC9FB7C12E44D2ADBC27DC5F73C45A'
wallet_api_key = '2DA70837270E4210BD4329D994B7D870'
card_merchant_id = 'python_sdk_test'
wallet_merchant_id = 'naveen_juspay'
api_key = '3E69335A241F49DFAE9C023BAB73D312'
merchant_id = 'ec_demo'
config.environment = 'sandbox'
config.api_key = api_key

def getCustomerId(): 
	return "C" + str(random.randint(1000000,2000000))

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
	order_id = "O" + str(random.randint(1000000,2000000))
	cust_id = getCustomerId()
	if request.args.get('customer_id'):
		cust_id = request.args.get('customer_id')
	params = {
	'order_id' : order_id,
	'amount' : float(amount),
	'customer_id' : cust_id,
	'customer_phone' : request.args.get('customer_phone'),
	'customer_email' : request.args.get('customer_email'),
	'return_url' : 'https://ec-python-demo.herokuapp.com/handle_payment'
	}
	try:
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
	cust_id = getCustomerId()
	if request.args.get('customer_id'):
		cust_id = request.args.get('customer_id')
	try:
		wallets = juspay.Wallets.list(customer_id = cust_id)
		wallets = map(lambda wallet : json.dumps(vars(wallet)),wallets)
		return json.dumps({'wallets':wallets})
	except Exception as e:
		errorMsg = "Error while retrieving wallets for customerId %s ." % cust_id
		print errorMsg, e
		return json.dumps({'Error' : errorMsg})

@app.route("/refresh_wallets")
def refresh_wallets():
	cust_id = getCustomerId()
	if request.args.get('customer_id'):
		cust_id = request.args.get('customer_id')
	try:
		wallets = juspay.Wallets.refreshBalance(customer_id = cust_id)
		wallets = map(lambda wallet : json.dumps(vars(wallet)),wallets)
		return json.dumps({'wallets':wallets})
	except Exception as e:
		errorMsg = "Error while refreshing Wallet Balance for customerId %s ." % cust_id
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