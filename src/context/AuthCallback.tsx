import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {useAuth} from "./AuthContext.tsx";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const {login} = useAuth()
    useEffect(() => {
        const params = new URLSearchParams(search);

        const token = params.get("token");
        const refresh_token = params.get("refresh_token");

        const userStr = params.get("user");
        const userObj = userStr ? JSON.parse(userStr) : null;


        const needsProfile = params.get("needs_profile") === "true";

        if (token && refresh_token && userObj) {
            localStorage.setItem("access_token", token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("user", JSON.stringify(userObj));
            if (needsProfile) {
                // store pre-fill data
                localStorage.setItem("prefill_profile", JSON.stringify({
                    email: params.get("email"),
                    first_name: params.get("first_name"),
                    last_name: params.get("last_name"),
                    avatar: params.get("avatar"),
                }));
                navigate("/complete-profile");
            } else {
                login(userObj, token, refresh_token);
                navigate("/applicant/dashboard");
            }
        } else {
            navigate("/login");
        }
    }, [navigate, search]);

    return <p>Redirecting...</p>;
};

export default AuthCallback;
