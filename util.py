import json
import os
import subprocess
from datetime import datetime

from hexbytes import HexBytes
from web3.datastructures import AttributeDict

RECEIPTS_PATH = 'receipts'
COMPILED_PATH = 'compiled'


def save_transaction_receipt_as_file(name, receipt, deploy_time=None):
    if not os.path.isdir(RECEIPTS_PATH):
        os.makedirs(RECEIPTS_PATH)

    file_name = f'{name}.json'
    if deploy_time:
        file_name = file_name.replace('.json', '_{}.json'.format(deploy_time))
    file = os.path.join(RECEIPTS_PATH, file_name)

    with open(file, 'w') as f:
        def default(o):
            if isinstance(o, HexBytes):
                return o.hex()
            elif isinstance(o, AttributeDict):
                return {k: default(v) for k, v in o.items()}
            elif isinstance(o, list):
                return [default(i) for i in o]
            else:
                return repr(o)

        f.write(json.dumps(dict(receipt),
                           indent=4,
                           default=default))


def load_depolyed_contract():
    receipt = {}
    abi = {}

    if not os.path.isdir(RECEIPTS_PATH):
        os.makedirs(RECEIPTS_PATH)
    if not os.path.isdir(COMPILED_PATH):
        os.makedirs(COMPILED_PATH)

    for file in sorted(os.listdir(RECEIPTS_PATH), reverse=True):  # 최신순
        if file.startswith('deploy'):
            with open(os.path.join(RECEIPTS_PATH, file), 'r') as f:
                receipt = json.loads(f.read())
            break

    for file in sorted(os.listdir(COMPILED_PATH), reverse=True):  # 최신순
        if file.startswith('abi'):
            with open(os.path.join(COMPILED_PATH, file), 'r') as f:
                abi = json.loads(f.read())
            break

    if receipt and abi:
        return receipt['contractAddress'], abi
    else:
        raise Exception('No deployed contracts.')


def save_compiled_sol(compiled_contract, compile_time=None):
    if not os.path.isdir(COMPILED_PATH):
        os.makedirs(COMPILED_PATH)

    for file_name, content in compiled_contract.items():
        if file_name in ['abi']:
            content = json.dumps(content, indent=4)

        if compile_time:
            file_name += f'_{compile_time}'
        file = os.path.join(COMPILED_PATH, file_name)

        with open(file, 'w') as f:
            f.write(content)
