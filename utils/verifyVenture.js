const verifyVenture = async (venture) => {
    return true;
    try {
        const res = await fetch(`${venture.site}/${venture.owner}.txt`,
            {
                mode: "no-cors",
            }
        );
        return res.status == 200 && res.text() == "Stake Verification"
            ? true
            : false;
    }
    catch (err) {
        return false
    }
}

export default verifyVenture;