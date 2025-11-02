import React from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function MigrateLocalToFirebase() {
    const migrate = async () => {
        const data = JSON.parse(localStorage.getItem("autobank_user_data") || "[]");
        if (!Array.isArray(data) || data.length === 0) {
            alert("No local data found to migrate!");
            return;
        }
        for (const user of data) {
            await addDoc(collection(db, "customers"), user);
        }
        alert("Data migration to Firebase complete!");
    };

    return (
        <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={migrate}
        >
            Migrate Local Data to Firebase
        </button>
    );
}
