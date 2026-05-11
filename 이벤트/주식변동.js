const Stock = require("../모델/주식");

module.exports = () => {

  setInterval(async () => {

    try {

      const stocks = await Stock.find();

      for (const stock of stocks) {

        // -10% ~ +10%
        const percent = Math.floor(Math.random() * 21) - 10;

        const changeAmount = Math.floor(
          stock.price * (percent / 100)
        );

        stock.price += changeAmount;

        // 최소 가격 제한
        if (stock.price < 100) {
          stock.price = 100;
        }

        stock.change = percent;

        await stock.save();
      }

      console.log("주식 가격 변동 완료");

    } catch (err) {

      console.error("주식 변동 오류:", err);

    }

  }, 600000); // 10분
};
