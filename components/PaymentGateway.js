import { Modal, Input, Spacer, Text, Snippet, Image, Display, Divider, useToasts } from "@geist-ui/core";
import { useState, useEffect } from 'react';
import {
    query,
    getDocs,
    setDoc,
    collection,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";

const PaymentGateway = (props) => {
    const { venture, user, dismiss } = props;

    const { setToast } = useToasts();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        amount: '',
        from: '',
        btcValue: null,
    })
    const [pubk, setPubk] = useState(null)

    const getWallet = async () => {
        if (!form.amount, !form.from) {
            setToast({ text: 'Please enter a valid amount and wallet address.', type: 'error' });
            return;
        }
        let res = await fetch('https://blockchain.info/ticker');
        let data = await res.json();
        let btcValue = data.USD.last;
        setForm({ ...form, btcValue });
        res = await fetch('/api/newWallet');
        data = await res.json();
        setPubk(data.pubk);
    }

    const submit = async () => {
        setLoading(true);

        // Decrement shares available
        let q = query(collection(db, "ventures"), where("name", "==", venture.name));
        let docs = await getDocs(q);
        docs.forEach(d => {
            let doc = d.data();
            setDoc(d.ref, {
                ...doc,
                currentSharesAvailable: doc.currentSharesAvailable - form.amount,
                totalShares: doc.totalShares - form.amount
            });
        })

        // Update assets
        q = query(collection(db, "users"), where("uid", "==", user.uid));
        docs = await getDocs(q);
        docs.forEach(d => {
            // let ref = doc(db, "ventures", venture._id);
            let document = d.data();
            setDoc(d.ref, {
                ...document,
                assets: [...document.assets, {
                    numShares: parseFloat(form.amount),
                    costPerShareUSD: parseFloat(venture.currentUSDPerShare),
                    venture: '5cC10wAyq1W3k2NMXiCk',
                }]
            });
        })

        setLoading(false);
        dismiss();
    }

    if (pubk) {
        return (
            <Modal visible={true} width='400px' onClose={dismiss}>
                <Modal.Title>Purchase {venture.name} Shares</Modal.Title>
                <Modal.Content>
                    <Text small type='warning'>
                        You are purchasing {form.amount.toLocaleString('en-us')} shares of {venture.name}
                        &nbsp;for ${(form.amount * venture.currentUSDPerShare).toLocaleString('en-us')} USD.
                        Please send {form.amount * venture.currentUSDPerShare / form.btcValue} BTC to the following address:
                    </Text>
                    <Spacer />
                    <Snippet>{pubk}</Snippet>
                    <Spacer h={1.5} />
                    <Divider />
                    <div style={{ width: '100%' }}>
                        <Display caption='Scan the code above to complete the transaction with the wallet of your choice.'>
                            <Image
                                style={{ borderRadius: '5px' }}
                                src={`https://chart.googleapis.com/chart?chs=225x225&chld=L|2&cht=qr&chl=bitcoin:${pubk}?amount=${form.amount * venture.currentUSDPerShare / form.btcValue}%26label=Stake%20Purchase%26message=Stake%20Purchase`}
                                alt="QR Code"

                            />
                        </Display>
                    </div>
                </Modal.Content>
                <Modal.Action passive onClick={dismiss}>Cancel</Modal.Action>
                <Modal.Action onClick={submit} loading={loading}>Purchase</Modal.Action>
            </Modal>
        )
    }
    return (
        <Modal visible={true} width='400px' onClose={dismiss}>
            <Modal.Title>Purchase {venture.name} Shares</Modal.Title>
            <Modal.Content>
                <Input
                    label="Share Quantity"
                    placeholder={`≤ ${venture.currentSharesAvailable.toLocaleString('en-us')}`}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    width="100%"
                />
                <Spacer h={0.5} />
                <Input
                    label="BTC Public Key"
                    placeholder="Your wallet address"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    width="100%"
                />
            </Modal.Content>
            <Modal.Action passive onClick={dismiss}>Cancel</Modal.Action>
            <Modal.Action onClick={getWallet} loading={loading}>Checkout</Modal.Action>
        </Modal>
    )
}

export default PaymentGateway