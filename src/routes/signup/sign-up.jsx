import React, {useState, useContext} from "react";
import './sign-up.scss'
import {useNavigate} from "react-router-dom";
import AccountContext from "../../context/AccountContext";
import {toast} from 'react-toastify';

export default function SignUp() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState('');
  const [code, setCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const {signup, confirmRegistration} = useContext(AccountContext);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  }

  const handleRegistration = (event) => {
    event.preventDefault();
    signup(email, name, password, profile, selectedOption, company)
      .then(data => {
        console.log("Registration Successful", data);
        setVerificationSent(true);
      })
      .catch(err => {
        console.log("Failed to register", err.message);
        toast.error('Failed to register. ' + err.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
  }

  const handleConfirmation = (event) => {
    event.preventDefault();
    confirmRegistration(email, code)
      .then(data => {
        console.log("Authentication Successful", data);
        navigate('/');
      })
      .catch(err => {
        console.log("Failed to confirm authentication", err.message);
        toast.error('Failed to confirm authentication. ' + err.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
  }

  return (
    <div className={'sign-up'}>
      <div className={'title'}>
        <span style={{color: '#6fa3bd', marginRight: '12px'}}>Columbia</span>
        <span style={{color: '#0033A0', marginRight: '12px'}}>Connect</span>
      </div>
      <div className={'login-box'}>
        <div className={'welcome'}>Welcome</div>
        {!verificationSent &&
          <>
            <div className={'radio-group'}>
              <label>
                <input
                  type="radio"
                  value="student"
                  checked={selectedOption === 'student'}
                  onChange={handleOptionChange}
                />
                Student
              </label>
              <label>
                <input
                  type="radio"
                  value="alumni"
                  checked={selectedOption === 'alumni'}
                  onChange={handleOptionChange}
                />
                Alumni
              </label>
            </div>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className={'input-box'}
                   type={'email'}
                   placeholder={'Email (only CU emails supported)'}/>
            <input value={password} onChange={(event) => setPassword(event.target.value)} className={'input-box'}
                   type={'password'} placeholder={'Password'}/>
            <input value={name} onChange={(event) => setName(event.target.value)} className={'input-box'} type={'text'}
                   placeholder={'Name'}/>
            {
              selectedOption === 'alumni' &&
              <input value={company} onChange={(event) => setCompany(event.target.value)} className={'input-box'}
                     type={'text'}
                     placeholder={'Current company'}/>
            }
            <input value={profile} onChange={(event) => setProfile(event.target.value)} className={'input-box'}
                   type={'text'} placeholder={'Linked In profile'}/>
          </>
        }
        {verificationSent &&
          <input value={code} onChange={(event) => setCode(event.target.value)} className={'input-box'}
                 placeholder='Enter Code sent in the email'/>
        }
        {!verificationSent && <button className={'login-btn'} onClick={handleRegistration}>Send code</button>}
        {verificationSent && <button className={'login-btn'} onClick={handleConfirmation}>Sign-up</button>}
        <div>
          <span>Already have an account? </span>
          <a className={'sign-up-btn'} href={'/'}>Login</a>
        </div>
      </div>
    </div>
  )
}