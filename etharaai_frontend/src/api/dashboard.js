import API from "./axiosInstance";

export const getDashboard = () => API.get("/dashboard/");
