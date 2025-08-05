let API_BASE = "";

const hostname = window.location.hostname;

if (
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.")
) {
  API_BASE = "http://localhost:5000"; 
} else {
  API_BASE = "https://enagic-kangen-backend.onrender.com"; 
}
export { API_BASE };