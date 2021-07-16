import json
import os

from hexbytes import HexBytes
from web3.datastructures import AttributeDict

BUILD_PATH = 'build'
RECEIPTS_PATH = 'receipts'


def load_depolyed_contract(name):
    if not os.path.isdir(BUILD_PATH):
        raise Exception('No deployed contracts.')

    for path, dirs, files in os.walk(BUILD_PATH):
        for filename in files:
            if filename == f"{name}.json":
                file = os.path.join(path, filename)

                with open(file, 'r') as f:
                    contract = json.loads(f.read())

                try:
                    address = contract['networks']['1001']['address']
                    abi = contract['abi']
                except IndexError:
                    raise Exception('Invalid contract.')
                return address, abi

    raise Exception('No deployed contracts.')


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
