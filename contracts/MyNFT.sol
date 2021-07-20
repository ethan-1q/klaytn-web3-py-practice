// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    struct NFT {
        string name;  // NFT의 이름
    }
    NFT[] public nfts; // 첫 아이템의 인덱스는 0입니다

    address public owner;

    constructor() ERC721("MyNFT", "MNFT") {
        owner = msg.sender; // 새 NFT를 발행할 수 있는 MyNFT 컨트랙트의 소유자
    }

    function mintNFT(string memory name, address account) public {
        require(owner == msg.sender); // 컨트랙트 소유자만이 NFT를 생성할 수 있습니다
        uint256 nftId = nfts.length; // 유일한 NFT ID
        nfts.push(NFT(name));
        _mint(account, nftId); // 새 NFT를 발행
    }

    function purchase(string memory name, address account) public payable {
        require(owner == msg.sender); // 컨트랙트 소유자만이 NFT를 생성할 수 있습니다
        uint256 nftId = nfts.length; // 유일한 NFT ID
        nfts.push(NFT(name));
        _mint(account, nftId); // 새 NFT를 발행
    }
}
