import json
import subprocess
from datetime import datetime

from util import save_compiled_sol, save_transaction_receipt_as_file

from solc.exceptions import SolcError


def compile_sol_file(source_file, name, compile_time):
    command = [
        'solc', '--optimize', '--combined-json', 'abi,bin',
        'openzeppelin-contracts=contracts/openzeppelin-contracts',
        source_file]

    proc = subprocess.Popen(command,
                            stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)

    stdoutdata, stderrdata = proc.communicate()

    if proc.returncode != 0:
        raise SolcError(
            command=command,
            return_code=proc.returncode,
            stdin_data='',
            stdout_data=stdoutdata,
            stderr_data=stderrdata,
        )

    compiled = json.loads(stdoutdata)

    compiled_contract = compiled['contracts'][f'{source_file}:{name}']

    abi = compiled_contract['abi']
    bin = compiled_contract['bin']

    save_compiled_sol(compiled_contract, compile_time)

    return abi, bin


def deploy_sol_file(w3, chain_id, source_file, name, contract_owner, contract_owner_private_key):
    deploy_time = datetime.now().strftime('%Y%m%d_%H%M%S')

    abi, bin = compile_sol_file(source_file, name, deploy_time)

    contract = w3.eth.contract(abi=abi, bytecode=bin)

    nonce = w3.eth.getTransactionCount(contract_owner)

    transaction = contract.constructor().buildTransaction(
        {'from': contract_owner, 'nonce': nonce, 'chainId': chain_id})
    # transaction['gas'] = int(transaction['gas'] * 1.2)

    signed = w3.eth.account.signTransaction(transaction, contract_owner_private_key)
    result = w3.eth.sendRawTransaction(signed.rawTransaction)
    receipt = w3.eth.waitForTransactionReceipt(result)

    save_transaction_receipt_as_file('deploy', receipt, deploy_time)

    return receipt


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
