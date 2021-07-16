from datetime import datetime

from app.util import save_transaction_receipt_as_file


def send_token(w3, contract, _from, _to, amount, sender_private_key):
    tx_execute_time = datetime.now().strftime('%Y%m%d_%H%M%S')

    nonce = w3.eth.getTransactionCount(_from)

    transaction = contract.functions.transfer(_to, amount).buildTransaction({
        'from': _from, 'nonce': nonce})
    # transaction['gas'] = int(transaction['gas'] * 1.2)

    signed = w3.eth.account.signTransaction(transaction, sender_private_key)
    result = w3.eth.sendRawTransaction(signed.rawTransaction)
    receipt = w3.eth.waitForTransactionReceipt(result)

    save_transaction_receipt_as_file('transfer', receipt, tx_execute_time)

    return receipt
