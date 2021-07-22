// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MyTrade is ERC721Holder{
    event TradeStatusChange(uint256 ad, bytes32 status);

    IERC20 currencyToken;
    IERC721 itemToken;

    struct Trade {
        address poster;
        uint256 item;
        bytes32 status; // Open, Executed, Cancelled
        address exchanger;
     }

    mapping(uint256 => Trade) public trades;
    mapping(uint256 => uint256) public id_map;

    uint256 tradeCounter;

    constructor (address currencyTokenAddr, address itemTokenAddr)
    {
        currencyToken = IERC20(currencyTokenAddr);
        itemToken = IERC721(itemTokenAddr);
        tradeCounter = 0;
    }

     /**
     * @dev trade(경매) 의 detail 정보 획득.
     * @param _trade trade id.
     */
    function getTrade(uint256 _trade)
        public
        view
        returns(address, uint256, bytes32, address)
    {
        Trade memory trade = trades[_trade];
        return (trade.poster, trade.item, trade.status, trade.exchanger);
    }

    /**
    * @dev 토큰 ID로 trade(경매) ID 를 가져온다
    * @param _item token_id
    */
    function getTradeId(uint256 _item)
        public
        view
        returns(uint256)
    {
        return (id_map[_item]);
    }


    /**
     * @dev 새로운 trade(경매) 시작. Exchanger(마켓 파트너) 에게 trade Item 을 전송한다.
     * @param _item token id
     * @param _exchanger exchanger address
     */
    function openTrade(uint256 _item, address _exchanger)
        public
    {
        itemToken.safeTransferFrom(msg.sender, _exchanger, _item);
        trades[tradeCounter] = Trade({
            poster: msg.sender,
            item: _item,
            status: "Open",
            exchanger: _exchanger
        });
        id_map[_item] = tradeCounter;
        tradeCounter += 1;
        emit TradeStatusChange(tradeCounter - 1, "Open");
    }

    /**
    * @dev trade(경매) 낙찰 실행. Exchanger 의 item을 buyer에게 전달하고, seller에게는 지정된 수수료 차감 후 판매대금을 지급한다.
    * @param _trade trade ID
    * @param _price 낙찰 금액(con)
    * @param _buyer 낙찰자 address
    * @param _org_author 원작자 address
    * @param _studio studio partner address
    * @param _org_author_csp 원작자에게 지급할 수수료 percentage
    * @param _exchanger_csp exchanger(마켓)에게 지급할 수수료 percentage
    * @param _studio_csp studio 에게 지급할 수수료 percentage
    */
    function executeTrade(uint256 _trade, uint _price, address _buyer,
        address _org_author, address _studio,
        uint256 _org_author_csp, uint256 _exchanger_csp, uint256 _studio_csp)
        public
    {
        Trade memory trade = trades[_trade];
        require(trade.status == "Open", "Trade is not Open.");
        currencyToken.transferFrom(_buyer, msg.sender, _price);

        uint256 org_author_cs = _price * _org_author_csp / 100;
        uint256 exchanger_cs = _price * _exchanger_csp / 100;
        uint256 studio_cs = _price * _studio_csp / 100;
        uint256 remain = _price - org_author_cs - exchanger_cs - studio_cs;

        currencyToken.transferFrom(msg.sender, trade.poster, remain);

        if (org_author_cs > 0) {
            currencyToken.transferFrom(msg.sender, _org_author, org_author_cs);
        }
        if (studio_cs > 0) {
            currencyToken.transferFrom(msg.sender, _studio, studio_cs);
        }

        itemToken.transferFrom(msg.sender, _buyer, trade.item);
        trades[_trade].status = "Executed";
        emit TradeStatusChange(_trade, "Executed");
    }

    /**
     * @dev trade(경매 취소)
     * @param _trade The trade to be cancelled.
     */
    function cancelTrade(uint256 _trade)
        public
    {
        Trade memory trade = trades[_trade];
        require(
            msg.sender == trade.poster,
            "Trade can be cancelled only by poster."
        );
        require(trade.status == "Open", "Trade is not Open.");
        itemToken.transferFrom(address(this), trade.poster, trade.item);
        trades[_trade].status = "Cancelled";
        emit TradeStatusChange(_trade, "Cancelled");
    }
}