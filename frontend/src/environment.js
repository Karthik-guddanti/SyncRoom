const getApiUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
    if (apiUrl.includes("|")) {
        const [prodUrl, localUrl] = apiUrl.split("|");
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        return isLocal ? localUrl : prodUrl;
    }
    return apiUrl;
};

const server = getApiUrl();
export default server;

