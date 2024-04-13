import axios from 'axios';

const API_URL = '/api/sign-up'; // 백엔드의 회원가입 API 경로

export const signup = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
