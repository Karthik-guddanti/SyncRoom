import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("username");
            window.location.href = "/auth";
        }
        return Promise.reject(error);
    }
);


export const AuthProvider = ({ children }) => {

    const [userData, setUserData] = useState(() => {
        try {
            return {
                name: localStorage.getItem("name") || "",
                username: localStorage.getItem("username") || ""
            };
        } catch {
            return { name: "", username: "" };
        }
    });


    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })


            if (request.status === httpStatus.CREATED) {
                return "Registration successful! Please login.";
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(username, password)
            console.log(request.data)

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                localStorage.setItem("name", request.data.name);
                localStorage.setItem("username", request.data.username);
                setUserData({
                    name: request.data.name,
                    username: request.data.username
                });
                router("/home")
            }
        } catch (err) {
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            const token = localStorage.getItem("token");
            let request = await client.get("/get_all_activity", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return request.data
        } catch (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            const token = localStorage.getItem("token");
            let request = await client.post("/add_to_activity", 
                { meeting_code: meetingCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return request
        } catch (e) {
            throw e;
        }
    }


    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}
