import API from "./axiosInstance";

export const getAttendance = (params = {}) =>
  API.get("/attendance/", { params });

export const markAttendance = (data) => API.post("/attendance/", data);

export const getAttendanceSummary = (employeeId) =>
  API.get(`/attendance/summary/${employeeId}`);
