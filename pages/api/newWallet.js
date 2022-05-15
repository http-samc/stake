import CoinKey from "coinkey"

export default (req, res) => {
    const wallet = new CoinKey.createRandom()
    // console.log(
    //     wallet.publicAddress,
    //     wallet.privateKey.toString("hex")
    // )
    res.json({
        pubk: wallet.publicAddress,
    })
}