import { Button, Fieldset, Text, Table, Avatar, Spacer, Tooltip, useToasts } from "@geist-ui/core";
import { Edit, Copy, PlusCircle, Gift } from "@geist-ui/icons";
import Link from "next/link";
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
import { db } from "../utils/firebase";

import CreateVenture from "./CreateVenture";
import EditVenture from "./EditVenture";
import Marketplace from "./Marketplace";
import verifyVenture from "../utils/verifyVenture";

const Dashboard = (props) => {
    const { user } = props;

    const [creatingVenture, setCreatingVenture] = useState(false);
    const [editingVenture, setEditingVenture] = useState(null);
    const [ventureData, setVentureData] = useState([]);

    const [assetData, setAssetData] = useState([]);

    const { setToast } = useToasts();

    useEffect(() => {
        const getData = async () => {
            await getAssetData();
            await getVentureData();
        }
        getData();

    }, [creatingVenture, editingVenture])

    const getAssetData = async () => {
        let data = [];
        let q = query(collection(db, "users"), where("uid", "==", user.uid));
        let docs = await getDocs(q);
        let userAssets;
        docs.forEach(d => userAssets = d);
        await userAssets.data()["assets"].forEach(async asset => {
            let ref = doc(db, "ventures", asset.venture);
            let venture = await getDoc(ref);
            data.push({ ...asset, ...venture.data() })
        });
        setAssetData(data);
    }

    const getVentureData = async () => {
        let data = [];
        let q = query(collection(db, "ventures"), where("owner", "==", user.uid));
        let docs = await getDocs(q);
        docs.forEach(d => data.push(d.data()));
        setVentureData(data);
    }

    return (
        <div>
            {
                creatingVenture &&
                <CreateVenture dismiss={() => setCreatingVenture(false)} user={user} />
            }
            {
                editingVenture &&
                <EditVenture dismiss={() => setEditingVenture(null)} user={user} venture={editingVenture} />
            }
            <Marketplace user={user} />
            <Spacer h={2} />
            <Text h1>Your Dashboard</Text>
            <Fieldset.Group value="Assets">
                <Fieldset label="Assets">
                    <Fieldset.Title>
                        {user.displayName.split(' ')[0]}'s Assets:
                    </Fieldset.Title>
                    <Spacer />
                    <Table data={assetData}>
                        <Table.Column
                            label="Name"
                            prop="name"
                            render={(v, rd, i) => {
                                return (
                                    <Tooltip text={rd.description} placement='bottomStart'>
                                        <Link href={rd.site}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={rd.logo} scale={1.5} />
                                                <Spacer />
                                                <Text>{rd.name}</Text>
                                            </div>
                                        </Link>
                                    </Tooltip>
                                )
                            }}
                        />
                        <Table.Column
                            label="Shares Available"
                            prop="currentSharesAvailable"
                            render={(v, rd, i) => {
                                return (
                                    <Text>
                                        {rd.currentSharesAvailable.toLocaleString('en-us')}/
                                        {rd.totalShares.toLocaleString('en-us')}
                                    </Text>
                                )
                            }}
                        />
                        <Table.Column
                            label="Shares Owned"
                            prop="numShares"
                            render={(v, rd, i) => <Text>{rd.numShares.toLocaleString('en-us')}</Text>}
                        />
                        <Table.Column
                            label="Current Price"
                            prop="currentUSDPerShare"
                            render={(v, rd, i) => {
                                return (
                                    <Text>${rd.currentUSDPerShare.toLocaleString('en-us')}</Text>
                                )
                            }}
                        />
                        <Table.Column
                            label="Purchase Price"
                            prop="costPerShareUSD"
                            render={(v, rd, i) => <Text>${rd.costPerShareUSD.toLocaleString('en-us')}</Text>}
                        />
                        <Table.Column
                            label="Total Value"
                            prop="currentValueUSD"
                            render={(v, rd, i) => {
                                let v0 = rd.costPerShareUSD * rd.numShares;
                                let v1 = rd.currentUSDPerShare * rd.numShares;
                                let pctIncr = Math.round(100 * (v1 - v0) / v0, 2);
                                return (
                                    <Text>
                                        ${(rd.currentUSDPerShare * rd.numShares).toLocaleString('en-us')}
                                    </Text>)
                            }}
                        />
                        <Table.Column
                            label="Profit/Loss"
                            prop="profitLossPCT"
                            render={(v, rd, i) => {
                                let v0 = rd.costPerShareUSD * rd.numShares;
                                let v1 = rd.currentUSDPerShare * rd.numShares;
                                let pctIncr = Math.round(100 * (v1 - v0) / v0, 2);
                                return (
                                    <Text>
                                        <span style={pctIncr > 0 ? { color: 'green' } : { color: 'red' }}>{pctIncr > 0 ? '+' : ''}{pctIncr}%</span>
                                    </Text>)
                            }}
                        />
                        <Table.Column
                            label="Action"
                            prop="action"
                            render={(v, rd, i) => {
                                return (
                                    <Button
                                        auto
                                        scale={0.5}
                                        icon={<Gift />}
                                        type='error'
                                        onClick={() => {
                                            setEditingVenture(rd);
                                        }}
                                    />
                                )
                            }}
                        />
                    </Table>
                </Fieldset>
                <Fieldset label="Ventures">
                    <Fieldset.Title>
                        {user.displayName.split(' ')[0]}'s Ventures:
                    </Fieldset.Title>
                    <Spacer />
                    <Table data={ventureData}>
                        <Table.Column
                            label="Name"
                            prop="name"
                            render={(v, rd, i) => {
                                return (
                                    <Tooltip text={rd.description} placement='bottomStart'>
                                        <Link href={rd.site}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={rd.logo} scale={1.5} />
                                                <Spacer />
                                                <Text>{rd.name}</Text>
                                            </div>
                                        </Link>
                                    </Tooltip>
                                )
                            }}
                        />
                        <Table.Column
                            label="Shares Available"
                            prop="currentSharesAvailable"
                            render={(v, rd, i) => {
                                return (
                                    <Text>
                                        {rd.currentSharesAvailable.toLocaleString('en-us')}/
                                        {rd.totalShares.toLocaleString('en-us')}
                                    </Text>
                                )
                            }}
                        />
                        <Table.Column
                            label="USD Per Share"
                            prop="currentUSDPerShare"
                            render={(v, rd, i) => {
                                return (
                                    <Text>${rd.currentUSDPerShare.toLocaleString('en-us')}</Text>
                                )
                            }}
                        />
                        <Table.Column
                            label="Action"
                            prop="action"
                            render={(v, rd, i) => {
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Button
                                            auto
                                            scale={0.5}
                                            icon={<Edit />}
                                            type='warning'
                                            onClick={() => {
                                                setEditingVenture(rd);
                                            }}
                                        />
                                        <Spacer w={0.5} />
                                        <Button
                                            auto
                                            scale={0.5}
                                            icon={<Copy />}
                                            type='success'
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `https://stake.smrth.dev/venture/${rd.name}`
                                                )
                                                    .then(() => setToast({ text: 'Link copied to clipboard', type: 'success' }));
                                            }}
                                        />
                                    </div>
                                )
                            }}
                        />
                    </Table>
                    <Fieldset.Footer>
                        ...
                        <Button
                            auto
                            icon={<PlusCircle />}
                            onClick={() => setCreatingVenture(true)}
                        >
                            Create Venture
                        </Button>
                    </Fieldset.Footer>
                </Fieldset>
            </Fieldset.Group>
        </div>
    )
}

export default Dashboard