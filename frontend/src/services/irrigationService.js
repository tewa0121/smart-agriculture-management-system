import api from "./api";

const getIrrigationRecords = async () => {
  const response = await api.get("/irrigation");

  return response.data;
};

const getIrrigationRecord = async (id) => {
  const response = await api.get(`/irrigation/${id}`);

  return response.data;
};

const createIrrigationRecord = async (irrigationData) => {
  const response = await api.post(
    "/irrigation",
    irrigationData
  );

  return response.data;
};

const updateIrrigationRecord = async (
  id,
  irrigationData
) => {
  const response = await api.put(
    `/irrigation/${id}`,
    irrigationData
  );

  return response.data;
};

const deleteIrrigationRecord = async (id) => {
  const response = await api.delete(
    `/irrigation/${id}`
  );

  return response.data;
};

export {
  getIrrigationRecords,
  getIrrigationRecord,
  createIrrigationRecord,
  updateIrrigationRecord,
  deleteIrrigationRecord,
};