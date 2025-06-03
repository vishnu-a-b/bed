import { configureStore } from '@reduxjs/toolkit'
import linkReducer from './slice/LinkSlice'
import authReducer from './slice/authSlice';
import userReducer from './slice/userSlice';
import staffReducer from './slice/staffSlice';
import organizationReducer from './slice/organizationSlice';
import employeeFilterReducer from './slice/employeeFilterSlice';
import updateReducer from './slice/updateSlice';
import countryReducer from './slice/countrySlice';
import bedReducer from './slice/bedSlice';
import supporterReducer from './slice/supporterSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      link: linkReducer,
      auth: authReducer,
      user: userReducer,
      staff: staffReducer,
      organization: organizationReducer,
      employeeFilter: employeeFilterReducer,
      update: updateReducer,
      country: countryReducer,
      bed: bedReducer,
      supporter: supporterReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
