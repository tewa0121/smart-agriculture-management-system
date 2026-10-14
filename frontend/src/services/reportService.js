import api from "./api";

export const getCropProductionReport = async (filters = {}) => {
return (await api.get("/reports/crop-production", { params: filters })).data;
};

export const getHarvestReport = async (filters = {}) => {
return (await api.get("/reports/harvests", { params: filters })).data;
};

export const getExpenseReport = async (filters = {}) => {
return (await api.get("/reports/expenses", { params: filters })).data;
};

export const getRevenueReport = async (filters = {}) => {
return (await api.get("/reports/revenue", { params: filters })).data;
};

export const getProfitReport = async (filters = {}) => {
return (await api.get("/reports/profit", { params: filters })).data;
};

export const getIrrigationReport = async (filters = {}) => {
return (await api.get("/reports/irrigation", { params: filters })).data;
};

export const getFertilizerReport = async (filters = {}) => {
return (await api.get("/reports/fertilizer", { params: filters })).data;
};

export const getActivityReport = async (filters = {}) => {
return (await api.get("/reports/activities", { params: filters })).data;
};
