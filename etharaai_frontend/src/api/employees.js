import API from "./axiosInstance";

export const getEmployees = () => API.get("/employees/");

export const getEmployee = (id) => API.get(`/employees/${id}`);

export const createEmployee = (data) => API.post("/employees/", data);

export const deleteEmployee = (id) => API.delete(`/employees/${id}`);
