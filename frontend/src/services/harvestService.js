
import api from "./api";

export const getHarvests = async () => {
  const response = await api.get("/harvests");
  return response.data;
};

export const getHarvest = async (id) => {
  const response = await api.get(`/harvests/${id}`);
  return response.data;
};

export const createHarvest = async (harvestData) => {
  const response = await api.post("/harvests", harvestData);
  return response.data;
};

export const updateHarvest = async (id, harvestData) => {
  const response = await api.put(`/harvests/${id}`, harvestData);
  return response.data;
};

export const deleteHarvest = async (id) => {
  const response = await api.delete(`/harvests/${id}`);
  return response.data;
};

