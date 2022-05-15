import { Modal, Input, Text, Spacer, Code, useToasts } from "@geist-ui/core";
import { useState } from "react";
import {
    query,
    getDocs,
    setDoc,
    collection,
    where,
    addDoc,
} from "firebase/firestore";

import { db } from "../utils/firebase";

const EditVenture = (props) => {
    const { user, dismiss, venture } = props;
    const [form, setForm] = useState({
        description: "",
        logo: "",
        currentSharesAvailable: venture.totalShares,
        currentUSDPerShare: venture.currentUSDPerShare,
    })
    const [loading, setLoading] = useState(false);

    const { setToast } = useToasts();

    const submit = async () => {
        setLoading(true);

        let filteredForm = Object
            .keys(form)
            .filter((key) => !!form[key])
            .reduce((cur, key) => { return Object.assign(cur, { [key]: form[key] }) }, {});

        const updatedVenture = {
            ...venture,
            ...filteredForm
        };

        // Update document
        let q = query(collection(db, "ventures"), where("name", "==", venture.name));
        let docs = await getDocs(q);
        let doc;
        docs.forEach(d => doc = d)
        setDoc(doc.ref, updatedVenture);

        setLoading(false);
        setToast({ text: 'Venture updated', type: 'success' });
        dismiss();
    }

    return (
        <Modal visible={true} width='700px' onClose={dismiss}>
            <Modal.Title>Edit {venture.name}</Modal.Title>
            <Modal.Content>
                <Text h3>The Basics:</Text>
                <Spacer h={0.5} />
                <Input
                    label="Description"
                    value={form.description}
                    placeholder="A consumer electronics manufacturer from Cupertino, California."
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    width="100%"
                />
                <Spacer h={0.5} />
                <Input
                    label="Logo (URL)"
                    value={form.logo}
                    placeholder="https://apple.com/my-transparent-logo.png"
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    width="100%"
                />
                <Spacer />
                <Text h3>Configure Offering:</Text>
                <Spacer h={0.5} />
                <div className="flx-h-sb" style={{ width: '100%' }}>
                    <Input
                        label="Shares Available"
                        value={form.currentSharesAvailable}
                        placeholder={`≤ ${venture.totalShares.toLocaleString('en-us')}`}
                        onChange={(e) => setForm({ ...form, currentSharesAvailable: parseFloat(e.target.value) })}
                        width="325px"
                    />
                    <Input
                        label="USD Per Share"
                        value={form.currentUSDPerShare}
                        placeholder="Any positive number"
                        onChange={(e) => setForm({ ...form, currentUSDPerShare: parseFloat(e.target.value) })}
                        width="325px"
                    />
                </div>
                <Spacer h={0.5} />
            </Modal.Content>
            <Modal.Action passive onClick={dismiss}>Cancel</Modal.Action>
            <Modal.Action loading={loading} onClick={submit}>Update</Modal.Action>
        </Modal>
    )
}

export default EditVenture