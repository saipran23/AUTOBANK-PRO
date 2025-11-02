import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EmployeeProfile = ({ userId }) => {
    const [profile, setProfile] = useState(null);
    const [edit, setEdit] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "employees", userId));
            setProfile(snap.data());
            setName(snap.data()?.name || "");
            setPhone(snap.data()?.phone || "");
        })();
    }, [userId]);

    const handleSave = async () => {
        await updateDoc(doc(db, "employees", userId), { name, phone });
        setEdit(false);
        setProfile((p) => ({ ...p, name, phone }));
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-xl font-bold mb-3">Employee Profile</h2>
            {!profile && <div>Loading...</div>}
            {profile &&
                <div>
                    {edit ? (
                        <>
                            <input value={name} onChange={e => setName(e.target.value)} className="border px-2 py-1 block mb-2" />
                            <input value={phone} onChange={e => setPhone(e.target.value)} className="border px-2 py-1 block mb-2" />
                            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSave}>Save</button>
                            <button className="ml-2" onClick={() => setEdit(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <div className="mb-2">Name: {profile.name}</div>
                            <div className="mb-2">Phone: {profile.phone}</div>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setEdit(true)}>Edit</button>
                        </>
                    )}
                </div>
            }
        </div>
    );
};

export default EmployeeProfile;
