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

    address public owner;
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => uint256) public tradeByItemId;
    uint256 tradeCounter;

    constructor (address currencyTokenAddr, address itemTokenAddr) {
        owner = msg.sender;
        currencyToken = MyToken(currencyTokenAddr);
        itemToken = MyNFT(itemTokenAddr);
        tradeCounter = 0;
    }

    /**
     * @dev 새로운 아이템 등록. 게시자는 NFT 아이템을 마켓에게 전송한다.
     * @param nftContent: NFT 내용
     * @param exchanger: 마켓 address
     */
    function openTrade(string memory nftContent, address exchanger) public {
        uint256 nftId = itemToken.getTokenIdFromContent(nftContent);
        itemToken.safeTransferFrom(msg.sender, exchanger, nftId);

        trades[tradeCounter] = Trade({
            poster: msg.sender,
            itemId: nftId,
            status: "Open",
            exchanger: exchanger
        });
        tradeByItemId[nftId] = tradeCounter;
        tradeCounter += 1;

        emit TradeStatusChange(tradeCounter - 1, "Open");
    }

    /**
     * @dev 아이템 등록 취소. NFT 아이템을 돌려받는다.
     * @param nftContent: NFT 내용
     */
    function cancelTrade(string memory nftContent) public {
        uint256 nftId = itemToken.getTokenIdFromContent(nftContent);
        uint256 tradeId = tradeByItemId[nftId];
        Trade memory trade = trades[tradeId];
        require(
            msg.sender == trade.poster,
            "Trade can only be canceled by the poster."
        );
        itemToken.safeTransferFrom(address(this), trade.poster, trade.itemId);
        trades[tradeId].status = "Cancelled";
        emit TradeStatusChange(tradeId, "Cancelled");
    }

    /**
     * @dev 거래 실행. 마켓은 NFT를 구매자에게 전송하고, 판매자에게는 수수료를 제외한 판매 대금을 전송한다.
     * @param nftContent: NFT 내용
     * @param price: 거래 성사 가격
     * @param buyer: 구매자 address
     * @param org_author: 원작자 address
     * @param org_author_csp: 원작자에게 지급할 수수료 percentage
     * @param exchanger_csp: 마켓에게 지급할 수수료 percentage
     */
    function executeTrade(string memory nftContent, uint256 price, address buyer,
        address org_author, uint256 org_author_csp, uint256 exchanger_csp)
        public
    {
        uint256 nftId = itemToken.getTokenIdFromContent(nftContent);
        uint256 tradeId = tradeByItemId[nftId];
        Trade memory trade = trades[tradeId];
        require(trade.status == "Open", "Trade is not Open.");

        currencyToken.transferFrom(buyer, msg.sender, price);

        uint256 org_author_cs = price * org_author_csp / 100;
        uint256 exchanger_cs = price * exchanger_csp / 100;
        uint256 remain = price - org_author_cs - exchanger_cs;

        currencyToken.transferFrom(msg.sender, trade.poster, remain);

        if (org_author_cs > 0) {
            currencyToken.transferFrom(msg.sender, org_author, org_author_cs);
        }

        itemToken.safeTransferFrom(address(this), buyer, trade.itemId);
        trades[tradeId].status = "Executed";
        emit TradeStatusChange(tradeId, "Executed");
    }
}