import api from "./api";

const getFarms = async () => {
  const response = await api.get("/farms");

  return response.data;
};

const getFarm = async (farmId) => {
  const response = await api.get(`/farms/${farmId}`);

  return response.data;
};

const createFarm = async (farmData) => {
  const response = await api.post(
    "/farms",
    farmData
  );

  return response.data;
};

const updateFarm = async (farmId, farmData) => {
  const response = await api.put(
    `/farms/${farmId}`,
    farmData
  );

  return response.data;
};

const deleteFarm = async (farmId) => {
  const response = await api.delete(
    `/farms/${farmId}`
  );

  return response.data;
};

export {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
};