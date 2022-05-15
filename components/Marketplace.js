import { Button, Card, Grid, Spacer, Text, User, Input } from "@geist-ui/core"
import { useState, useEffect } from "react";
import {
    query,
    getDocs,
    doc,
    collection,
    where,
    addDoc,
    getDoc,
} from "firebase/firestore";
import { Search } from "@geist-ui/icons";
import { db } from "../utils/firebase";
import verifyVenture from "../utils/verifyVenture";
import PaymentGateway from "./PaymentGateway";

const Marketplace = (props) => {
    const { user } = props;

    const [market, setMarket] = useState([])
    const [search, setSearch] = useState("")
    const [isPurchasing, setIsPurchasing] = useState(null)

    useEffect(() => {
        const getData = async () => {
            await getMarket();
        }
        getData();
    }, [])

    const getMarket = async () => {
        let docs = await getDocs(query(collection(db, "ventures")));
        let ventures = docs.docs.map((doc) => doc.data());
        ventures = ventures.map((venture) => {
            return {
                ...venture,
                verified: verifyVenture(venture)
            }
        });
        setMarket(ventures);
        console.log(market)
    }

    return (
        <div>
            {
                isPurchasing &&
                <PaymentGateway user={user} venture={isPurchasing} dismiss={() => setIsPurchasing(null)} />
            }
            <div className="flx-h-sb">
                <Text h1>The Marketplace</Text>
                <Input
                    placeholder="Search"
                    iconRight={<Search />}
                    size="large"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Grid.Container gap={2} justify='center'>
                {
                    market.map((venture, idx) => {
                        let vd = venture.name + venture.description;
                        if (!vd.toLowerCase().includes(search.toLowerCase()))
                            return

                        return (
                            <Grid
                                xs={12}
                                sm={12}
                                md={8}
                                lg={6}
                                xl={6}
                                width="100%"
                                key={idx}
                            >
                                <Card width="100%">
                                    <User src={venture.logo} name={venture.name} style={{ marginLeft: -10 }}>
                                        <User.Link href={venture.site}>{venture.site.replace('https://', '').split('/')[0]}</User.Link>
                                    </User>
                                    <Spacer h={0.5} />
                                    <Text small i>{venture.description}</Text>
                                    <Spacer h={0.5} />
                                    <Card.Footer className="flx-h-sb">
                                        <Text small type='warning'>
                                            ${venture.currentUSDPerShare.toLocaleString('en-us')} per share
                                        </Text>
                                        <Button
                                            auto
                                            ghost
                                            scale={0.5}
                                            type="success"
                                            onClick={() => {
                                                setIsPurchasing(venture)
                                            }}
                                        >&nbsp;&nbsp;Buy Now</Button>
                                    </Card.Footer>
                                </Card>
                            </Grid>
                        )
                    })
                }
            </Grid.Container>
        </div>
    )
}

export default Marketplace