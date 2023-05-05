import React, {useState, useContext} from "react";
import './home.scss'
import {useNavigate} from "react-router-dom";
import AccountContext from "../../context/AccountContext";
import {toast} from "react-toastify";
import axios from "axios";
import {format} from "date-fns";

export default function Home() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {authenticate} = useContext(AccountContext);

  const navigateAccToType = (email) => {
    (async () => {
      try {
        let result = await axios.get('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/user-profile?userId=' + email);
        let userType = result.data.requests.userType;
        if (userType === 'student')
          navigate('/student')
        else
          navigate('/alumni')
      } catch (e) {
        toast.error("Login error!")
      }
    })();
  }

  const handleLogin = (event) => {
    event.preventDefault();
    authenticate(email, password)
    .then(data => {
      console.log("Login Successful", data);
      let localStorageValue = {email: data['idToken']['payload']['email'], jwt: data['idToken']['jwtToken']};
      localStorage.setItem('login', JSON.stringify(localStorageValue));
      navigateAccToType(email)
    })
    .catch(err => {
      console.log("Failed to login", err.message);
      toast.error("Failed to login: " + err.message)
    })
  }

  return (
    <div className={'home'}>
      <div className={'title'}>
        <span style={{color: '#6fa3bd', marginRight: '12px'}}>Columbia</span>
        <span style={{color: '#0033A0', marginRight: '12px'}}>Connect</span>
      </div>
      <div className={'login-box'}>
        <div className={'welcome'}>Welcome</div>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type={'email'} placeholder={'Email'}/>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type={'password'} placeholder={'Password'}/>
        <button onClick={handleLogin} className={'login-btn'}>Login</button>
        <div>
          <span>Don't have an account? </span>
          <a href={'sign-up'} className={'sign-up-btn'}>Sign up</a>
        </div>
      </div>
    </div>
  )
}