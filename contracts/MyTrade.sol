// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "../contracts/MyToken.sol";
import "../contracts/MyNFT.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MyTrade is ERC721Holder{
    event TradeStatusChange(uint256 tradeId, bytes32 status);

    struct Trade {
        address poster;
        uint256 itemId;
        bytes32 status; // Open, Executed, Cancelled
        address exchanger;
    }

    MyToken public currencyToken;
    MyNFT public itemToken;

    mapping(uint256 => Trade) public trades;
    mapping(uint256 => uint256) public tradeByItemId;
    uint256 tradeCounter;

    constructor (address currencyTokenAddr, address itemTokenAddr) {
        currencyToken = MyToken(currencyTokenAddr);
        itemToken = MyNFT(itemTokenAddr);
        tradeCounter = 0;
    }

    /**
     * @dev 새로운 아이템 등록. 마켓에게 NFT 아이템을 전송한다.
     * @param nftData: NFT 내용
     * @param exchanger_: 마켓 계정 주소
     */
    function openTrade(string memory nftData, address exchanger_) public {
        uint256 nftId = itemToken.getTokenIdFromData(nftData);
        itemToken.safeTransferFrom(msg.sender, exchanger_, nftId);

        trades[tradeCounter] = Trade({
            poster: msg.sender,
            itemId: nftId,
            status: "Open",
            exchanger: exchanger_
        });
        tradeByItemId[nftId] = tradeCounter;
        tradeCounter += 1;

        emit TradeStatusChange(tradeCounter - 1, "Open");
    }
}