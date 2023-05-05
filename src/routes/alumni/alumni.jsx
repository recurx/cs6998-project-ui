import React, {useEffect, useRef, useState} from "react";
import {NavLink, Outlet, useNavigate} from "react-router-dom";
import chatSvg from "../../assets/chat.svg";
import './alumni.scss'
import {useImmer} from "use-immer";
import axios from "axios";
import {format} from "date-fns";
import {toast} from "react-toastify";

const Alumni = () => {
  const defaultPastResumeRequests = [
    {
      date: '04/11/2023',
      student: 'Loop me',
      status: 'pending',
    },
    {
      date: '04/01/2023',
      student: 'Cool deed',
      status: 'completed',
    },
    {
      date: '04/11/2023',
      student: 'Mr. X',
      status: 'rejected',
    },
  ]
  const defaultPastReferralRequests = [
    {
      date: '04/11/2023',
      student: 'Loop me',
      company: 'Google',
      status: 'pending',
    },
    {
      date: '04/01/2023',
      student: 'Cool deed',
      company: 'Columbia ccbd',
      status: 'completed',
    },
    {
      date: '04/11/2023',
      student: 'Mr. X',
      company: 'CCBD',
      status: 'rejected',
    },
  ]
  const [pastResumeRequests, setPastResumeRequests] = useImmer(defaultPastResumeRequests)
  const [pastReferralRequests, setPastReferralRequests] = useImmer(defaultPastReferralRequests)
  const [user, setUser] = useState({name: 'Avery', email: 'avery@columbia.edu', openToRefer: 'yes', openToReview: 'no'})
  const loginInfoRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    let loginInfo = JSON.parse(localStorage.getItem('login'));
    try {
      if (loginInfo && loginInfo.email && loginInfo.jwt) {
        loginInfoRef.current = (loginInfo)
      } else {
        navigate('/');
      }
    } catch (e) {
      navigate('/');
    }

    (async () => {
      try {
        let result = await axios.get('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/referral-requests?userId=' + loginInfo.email);
        let data = result.data.requests;
        console.log(data);
        for (let i=0; i<data.length; i++) {
          var date = new Date(data[i].timestamp * 1000);
          data[i].date = format(date, 'yyyy-MM-dd');
          if (data[i].aid_profile) {
            data[i].referrer = data[i].aid_profile.name
            data[i].company = data[i].aid_profile.company
          }
        }
        //setPastRequests(data);
      } catch (e) {
        toast.error("Failed to get past requests!")
      }
    })();
  }, [])

  const changeOpenToRefer = (e) => {
    // TODO: call user update API
    setUser({...user, openToRefer: e.target.value})
  }

  const changeOpenToReview = (e) => {
    // TODO: call user update API
    setUser({...user, openToReview: e.target.value})
  }

  const changeResumeRequestStatus = (index, newStatus) => {
    // TODO: call API
    setPastResumeRequests(reqs => {
      reqs[index].status = newStatus
    })
  }

  const changeReferralRequestStatus = (index, newStatus) => {
    // TODO: call API
    setPastReferralRequests(reqs => {
      reqs[index].status = newStatus
    })
  }

  return (
    <div className={'alumni'}>
      <div className={'navbar'}>
        <div className={'logo'}>
          <span style={{color: '#6fa3bd', marginRight: '12px'}}>Columbia</span>
          <span style={{color: '#0033A0', marginRight: '12px'}}>Connect</span>
        </div>

        <div className={'chat-btn'}>
          <img alt={'chat'} src={chatSvg}/>
        </div>
        {/*<div className={'profile'}></div>*/}
      </div>
      <div className={'body'}>
        <div className={'welcome'}>
          Hello {user.name}, Thank you so much for your contributions!
          Your efforts have helped the students a lot. You are a star!!!
        </div>
        <div className={'preferences'}>
          <div className={'pref'}>
            <span>Are you open to giving referrals to students?</span>
            <label style={{color: "#0033A0"}}><input type={'radio'} name={'referral'}
                          value={'yes'}
                          checked={user.openToRefer === 'yes'}
                          onChange={changeOpenToRefer}/>Yes</label>
            <label style={{color: "#ff7373"}}><input type={'radio'} name={'referral'}
                          value={'no'}
                          checked={user.openToRefer === 'no'}
                          onChange={changeOpenToRefer}/>No</label>
          </div>
          <div className={'pref'}>
            <span>Are you open to reviewing resumes?</span>
            <label style={{color: "#0033A0"}}><input type={'radio'} name={'resume'}
                          value={'yes'}
                          checked={user.openToReview === 'yes'}
                          onChange={changeOpenToReview}/>Yes</label>
            <label style={{color: "#ff7373"}}><input type={'radio'} name={'resume'}
                          value={'no'}
                          checked={user.openToReview === 'no'}
                          onChange={changeOpenToReview}/>No</label>
          </div>
        </div>
        <div className={'past'}>
          <div style={{fontSize: '24px', lineHeight: '29px', color: '#0033A0'}}>Referral requests</div>
          <table>
            <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {pastReferralRequests.map((request, index) => {
              return <tr key={index}>
                <td>{request.date}</td>
                <td>{request.student}</td>
                <td>{request.company}</td>
                <td>
                  <label style={{color: "#fba505"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'pending'}
                                                           checked={request.status === 'pending'}
                                                           onChange={() => changeReferralRequestStatus(index, 'pending')}/>
                    Pending
                  </label>
                  <label style={{color: "#0033A0"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'accepted'}
                                                           checked={request.status === 'accepted'}
                                                           onChange={() => changeReferralRequestStatus(index, 'accepted')}/>
                    Accepted
                  </label>
                  <label style={{color: "#ff7373"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'rejected'}
                                                           checked={request.status === 'rejected'}
                                                           onChange={() => changeReferralRequestStatus(index, 'rejected')}/>
                    Rejected
                  </label>
                  <label style={{color: "#4b4b4b"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'completed'}
                                                           checked={request.status === 'completed'}
                                                           onChange={() => changeReferralRequestStatus(index, 'completed')}/>
                    Completed
                  </label>
                </td>
              </tr>
            })}

            </tbody>
          </table>
        </div>

        <div className={'past'}>
          <div style={{fontSize: '24px', lineHeight: '29px', color: '#0033A0'}}>Resume requests</div>
          <table>
            <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {pastResumeRequests.map((request, index) => {
              return <tr key={index}>
                <td>{request.date}</td>
                <td>{request.student}</td>
                <td>
                  <label style={{color: "#fba505"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'pending'}
                                                           checked={request.status === 'pending'}
                                                           onChange={() => changeResumeRequestStatus(index, 'pending')}/>
                    Pending
                  </label>
                  <label style={{color: "#0033A0"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'accepted'}
                                                           checked={request.status === 'accepted'}
                                                           onChange={() => changeResumeRequestStatus(index, 'accepted')}/>
                    Accepted
                  </label>
                  <label style={{color: "#ff7373"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'rejected'}
                                                           checked={request.status === 'rejected'}
                                                           onChange={() => changeResumeRequestStatus(index, 'rejected')}/>
                    Rejected
                  </label>
                  <label style={{color: "#4b4b4b"}}><input type={'checkbox'} name={`req-${index}`}
                                                           value={'completed'}
                                                           checked={request.status === 'completed'}
                                                           onChange={() => changeResumeRequestStatus(index, 'completed')}/>
                    Completed
                  </label>
                </td>
              </tr>
            })}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Alumni