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

const CreateVenture = (props) => {
    const { user, dismiss } = props;
    const [form, setForm] = useState({
        name: "",
        description: "",
        site: "",
        logo: "",
        totalShares: Math.pow(10, 4),
        initialSharesAvailable: 5 * Math.pow(10, 3),
        initialUSDPerShare: 5,
    })
    const [loading, setLoading] = useState(false);

    const { setToast } = useToasts();

    const submit = async () => {
        setLoading(true);

        const venture = {
            ...form,
            currentSharesAvailable: form.initialSharesAvailable,
            currentUSDPerShare: form.initialUSDPerShare,
            owner: user.uid,
            createdAt: new Date(),
        };

        // Check for taken venture name
        let q = query(collection(db, "ventures"), where("name", "==", venture.name));
        let docs = await getDocs(q);
        if (docs.docs.length > 0) {
            setToast({ text: 'Venture name already exists', type: 'error' });
            return;
        }

        // Add venture to registry
        let ventureRef = await addDoc(collection(db, "ventures"), venture);

        // Add venture to user's ventures
        q = query(collection(db, "users"), where("uid", "==", user.uid));
        docs = await getDocs(q);
        let doc;
        docs.forEach(d => doc = d)
        let data = doc.data();

        setDoc(doc.ref, {
            ...data,
            ventures: [...data['ventures'], ventureRef.id]
        })
        setLoading(false);
        setToast({ text: 'Venture created', type: 'success' });
        dismiss();
    }

    return (
        <Modal visible={true} width='700px' onClose={dismiss}>
            <Modal.Title>Create Venture</Modal.Title>
            <Modal.Content>
                <Text h3>The Basics:</Text>
                <Spacer h={0.5} />
                <Input
                    label="Legal name"
                    value={form.name}
                    placeholder="Apple, Inc."
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    width="100%"
                />
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
                    label="Official Site"
                    value={form.site}
                    placeholder="https://apple.com"
                    onChange={(e) => setForm({ ...form, site: e.target.value })}
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
                <Text h3>Verification:</Text>
                <Code block name={`${form.site}/${user.uid}.txt`}>
                    Stake Verification
                </Code>
                <Text type="success">
                    Place the text file above to the given unique URL on your
                    website's server to verify your venture.
                </Text>
                <Text h3>Configure Offering:</Text>
                <Spacer h={0.5} />
                <div className="flx-h-sb">
                    <Input
                        label="Total Shares**"
                        value={form.totalShares.toLocaleString('en-us')}
                        placeholder="A number from 1,000,000 to 1,000,000,000"
                        onChange={(e) => setForm({ ...form, totalShares: e.target.value })}
                        width="100%"
                    />
                </div>
                <Spacer h={0.5} />
                <div className="flx-h-sb" style={{ width: '100%' }}>
                    <Input
                        label="IPO (# shares)"
                        value={form.initialSharesAvailable.toLocaleString('en-us')}
                        placeholder={`≤ ${form.totalShares.toLocaleString('en-us')}`}
                        onChange={(e) => setForm({ ...form, initialSharesAvailable: e.target.value })}
                        width="325px"
                    />
                    <Input
                        label="IPO ($/Share)"
                        value={form.initialUSDPerShare.toLocaleString('en-us')}
                        placeholder="Any positive number"
                        onChange={(e) => setForm({ ...form, initialUSDPerShare: e.target.value })}
                        width="325px"
                    />
                </div>
                <Spacer h={0.5} />
                <Text>
                    By creating this venture, you will issue <span className="warn">{form.totalShares.toLocaleString('en-us')}</span> shares to yourself, <span className="warn">{form.initialSharesAvailable.toLocaleString('en-us')}</span> of which will be initially available to the public for purchase at an approximate price of <span className="warn">${form.initialUSDPerShare.toLocaleString('en-us')}</span> per share.
                </Text>
                <Text small>**The total share quantity is not mutable after creation. Ensure it is correct before proceeding.</Text>
            </Modal.Content>
            <Modal.Action passive onClick={dismiss}>Cancel</Modal.Action>
            <Modal.Action loading={loading} onClick={submit}>Create</Modal.Action>
        </Modal>
    )
}

export default CreateVenture