import api from "./api";

const getFieldsByFarm = async (farmId) => {
  const response = await api.get(
    `/fields/farm/${farmId}`
  );

  return response.data;
};

const getField = async (fieldId) => {
  const response = await api.get(
    `/fields/${fieldId}`
  );

  return response.data;
};

const createField = async (farmId, fieldData) => {
  const response = await api.post(
    `/fields/farm/${farmId}`,
    fieldData
  );

  return response.data;
};

const updateField = async (fieldId, fieldData) => {
  const response = await api.put(
    `/fields/${fieldId}`,
    fieldData
  );

  return response.data;
};

const deleteField = async (fieldId) => {
  const response = await api.delete(
    `/fields/${fieldId}`
  );

  return response.data;
};

export {
  getFieldsByFarm,
  getField,
  createField,
  updateField,
  deleteField,
};