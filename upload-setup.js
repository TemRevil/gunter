import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCxvhMQt4Z6nfbYyR7nv9aW57fDVO-tweE",
    authDomain: "lack-v.firebaseapp.com",
    projectId: "lack-v",
    storageBucket: "lack-v.firebasestorage.app",
    messagingSenderId: "117204444860",
    appId: "1:117204444860:web:a15581d39c2d06b94f52b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function uploadSetup() {
    try {
        // Sign in (using the auto-login credentials)
        console.log('Authenticating...');
        await signInWithEmailAndPassword(auth, "gunter-v@gunter.com", "!@wqsdXD@#1@1");
        console.log('✅ Authenticated as:', auth.currentUser.email);

        const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
        const version = packageJson.version;
        const setupPath = join(__dirname, 'release', `Gunter Management System Setup ${version}.exe`);
        const fileBuffer = readFileSync(setupPath);

        const storageRef = ref(storage, 'Setup/GunterSetup.exe');

        console.log('Uploading file to Firebase Storage...');
        console.log('File size:', (fileBuffer.length / (1024 * 1024)).toFixed(2), 'MB');

        await uploadBytes(storageRef, fileBuffer);
        console.log('✅ Upload successful! File is now at: Setup/GunterSetup.exe');
        process.exit(0);
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    }
}

uploadSetup();
