export function writeDataToDB(path, data) {
  localStorage.setItem(path, JSON.stringify(data));
}

export function readDataFromDB(path) {
  return JSON.parse(localStorage.getItem(path));
}