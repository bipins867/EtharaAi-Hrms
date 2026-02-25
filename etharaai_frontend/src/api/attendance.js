import API from "./axiosInstance";

export const getAttendanceByEmployee = (employeeId, date) => {
  const params = {};
  if (date) params.date = date;
  return API.get(`/attendance/${employeeId}`, { params });
};

export const markAttendance = (data) => API.post("/attendance", data);
