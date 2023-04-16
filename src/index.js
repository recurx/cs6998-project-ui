import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./routes/home/home";
import SignUp from "./routes/signup/sign-up";
import Student from "./routes/student/student";
import Referral from "./routes/student/routes/referral/referral";
import Resume from "./routes/student/routes/resume/resume";
import AccountState from './states/AccountState';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AccountState><Home/></AccountState>,
  },
  {
    path: "sign-up",
    element: <AccountState><SignUp/></AccountState>,
  },
  {
    path: "student",
    element: <Student />,
    children: [
      {
        path: "",
        element: <Referral />
      },
      {
        path: "resume",
        element: <Resume />
      }
    ]
  }
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
    <ToastContainer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
