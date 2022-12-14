import firebase from "firebase";
import "firebase/auth"

var firebaseConfig = {
    apiKey: "AIzaSyCW_p7tCMG-n5S4Xz44LJApFE9CUrqOr0A",
    authDomain: "style-factory-34786.firebaseapp.com",
    projectId: "style-factory-34786",
    storageBucket: "style-factory-34786.appspot.com",
    messagingSenderId: "93861136194",
    appId: "1:93861136194:web:3de2c47ce9f152fd73eadb",
    measurementId: "G-J5G9XKDJER"
};

firebase.initializeApp(firebaseConfig);

export default firebase