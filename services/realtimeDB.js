import app from './firebase.js';
import { getDatabase, ref, set, onValue } from "firebase/database";

const db = getDatabase(app);

export function writeData(path, data) {
  set(ref(db, path), data);
}

// Callback deve receber um objeto como parametro, que sera o valor atualizado
export function readData(path, callback) {
  const pathRef = ref(db, path);
  onValue(pathRef, (snapshot) => {
    callback(snapshot.val());
  });
}