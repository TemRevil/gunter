import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCxvhMQt4Z6nfbYyR7nv9aW57fDVO-tweE",
    authDomain: "lack-v.firebaseapp.com",
    projectId: "lack-v",
    storageBucket: "lack-v.firebasestorage.app",
    messagingSenderId: "117204444860",
    appId: "1:117204444860:web:a15581d39c2d06b94f52b9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const publishVersion = async () => {
    try {
        console.log("Updating Firestore version to 1.10.0...");
        const versionRef = doc(db, "Control", "Version");
        await setDoc(versionRef, {
            LatestVersion: "1.10.0",
            DownloadURL: "https://github.com/TemRevil/gunter/releases/download/v1.10.0/Gunter.Management.System.Setup.1.10.0.exe"
        }, { merge: true });

        console.log("Successfully published version 1.10.0 to Firestore.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to publish version:", error);
        process.exit(1);
    }
};

publishVersion();
