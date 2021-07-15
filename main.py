import sys
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware

from contract import deploy_sol_file, send_token
from util import load_depolyed_contract


w3 = Web3(HTTPProvider('http://chainnet-en-pg001.dakao.io:8551'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# 컨트랙트 배포자 주소
contract_owner_address = w3.toChecksumAddress('0x5c1e67e5efaab009636dc332cfaea990b0cb156f')
# 컨트랙트 배포자 private key
contract_owner_priavte_key = '0x19a0e6c99aaef89900278e29af962e35bab66394312e55d891a97d51e781cda0'
# 토큰 전송 테스트용 계정 주소
test_address = w3.toChecksumAddress('0x9e06bf1eca9e3194141f7bede658a8d344614db9')

# 배포
if 'deploy' in sys.argv:
    receipt = deploy_sol_file(
        w3,
        1001,  # baobab
        'contracts/MyERC20.sol',
        'GLDToken',
        contract_owner_address,
        contract_owner_priavte_key)

    print('Deployed to: {}'.format(receipt['contractAddress']))
    print()

address, abi = load_depolyed_contract()

contract = w3.eth.contract(address, abi=abi)

# 토큰 정보 훑어보기
print('contract.address:', contract.address)
print('name:', contract.functions.name().call())
print('symbol:', contract.functions.symbol().call())
print('totalSupply:', contract.functions.totalSupply().call())

decimals = contract.functions.decimals().call()
print('decimals:', decimals)
DECIMALS = 10 ** decimals
print("totalSupply // DECIMALS:", contract.functions.totalSupply().call() // DECIMALS)
print()

# 잔액 조회
print(f'balanceOf({contract_owner_address}):',
      contract.functions.balanceOf(contract_owner_address).call())
print(f'balanceOf({test_address}):',
      contract.functions.balanceOf(test_address).call())
print()

if 'send_token' in sys.argv:
    # 토큰 전송
    receipt = send_token(w3, contract, contract_owner_address, test_address, 10000000, contract_owner_priavte_key)
    print('receipt:', receipt)
    print()

    # 잔액 조회
    print(f'balanceOf({contract_owner_address}):',
          contract.functions.balanceOf(contract_owner_address).call())
    print(f'balanceOf({test_address}):',
          contract.functions.balanceOf(test_address).call())
    print()
