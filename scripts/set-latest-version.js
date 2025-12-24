import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

const setLatest = async (version) => {
    try {
        console.log('Signing in...');
        await signInWithEmailAndPassword(auth, "lack-v@lack.com", "!@wqsdXD@#1@1");
        console.log('Signed in.');

        const ref = doc(db, 'Control', 'Version');
        await setDoc(ref, { LatestVersion: version }, { merge: true });

        console.log(`Successfully set LatestVersion to ${version} in Control/Version`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to set LatestVersion:', err);
        process.exit(1);
    }
};

const argVersion = process.argv[2] || '1.10.10';
setLatest(argVersion);
