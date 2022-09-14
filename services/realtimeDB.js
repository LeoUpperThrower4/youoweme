export function writeData(path, data) {
  localStorage.setItem(path, JSON.stringify(data));
}

export function readData(path) {
  return JSON.parse(localStorage.getItem(path));
}