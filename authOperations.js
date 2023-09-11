import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  signIn,
  signOut,
  getUser,
  getRefreshToken,
  updateBalance,
} from '../services';
import {
  fetchIncomeCategories,
  fetchExpenseCategories,
  fetchIncome,
  fetchExpense,
} from '../redux/transactionsOperations';
import { showErrorMessage } from '../components/Toasters';

const token = {
  set(token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  unset() {
    axios.defaults.headers.common.Authorization = '';
  },
};

export const logIn = createAsyncThunk(
  'auth/logIn',
  async function (credentials, { rejectWithValue, dispatch }) {
    try {
      const { data } = await signIn(credentials);
      token.set(data.accessToken);
      sessionStorage.setItem('token', data.accessToken);
      sessionStorage.setItem('refreshToken', data.refreshToken);
      sessionStorage.setItem('sid', data.sid);
      dispatch(fetchIncomeCategories());
      dispatch(fetchExpenseCategories());
      return data;
    } catch (error) {
      showErrorMessage(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const logInGoogle = createAsyncThunk(
  'auth/logIn',
  async function (response, { rejectWithValue, dispatch }) {
    try {
      token.set(response.accessToken);
      sessionStorage.setItem('token', response.accessToken);
      sessionStorage.setItem('refreshToken', response.refreshToken);
      sessionStorage.setItem('sid', response.sid);
      await dispatch(getCurrentUser());
      return response;
    } catch (error) {
      showErrorMessage(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const logOut = createAsyncThunk(
  'auth/logOut',
  async function (_, { rejectWithValue, dispatch }) {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('sid');
      sessionStorage.removeItem('refreshToken');
      await signOut();
      token.unset();
    } catch (error) {
      showErrorMessage(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async function (_, { rejectWithValue, dispatch }) {
    try {
      const accessToken = sessionStorage.getItem('token');
      token.set(accessToken);
      const response = await getUser();
      if (response.data) {
        dispatch(fetchIncome());
        dispatch(fetchExpense());
      }
      return response.data;
    } catch (error) {
      showErrorMessage(error.message);
      return rejectWithValue(error.message);
    }
  },
);
export const updateUserBalance = createAsyncThunk(
  'auth/updateUserBalance',
  async function (balance, { rejectWithValue, dispatch }) {
    try {
      const response = await updateBalance(balance);
      return response.data;
    } catch (error) {
      showErrorMessage(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const refresh = createAsyncThunk(
  'auth/refresh',
  async function (_, { rejectWithValue, dispatch, getState }) {
    const sid = sessionStorage.getItem('sid');
    const refreshToken = sessionStorage.getItem('refreshToken');
    try {
      const response = await getRefreshToken({ refreshToken, sid });
      token.set(response.data.newAccessToken);
      dispatch(getCurrentUser());
      return response.data;
    } catch (error) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('sid');
      sessionStorage.removeItem('refreshToken');
      token.unset();
      showErrorMessage(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const authOperations = {
  logIn,
  logInGoogle,
  logOut,
  getCurrentUser,
  updateUserBalance,
  refresh,
};

export default authOperations;
