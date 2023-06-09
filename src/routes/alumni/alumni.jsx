import React, {useEffect, useRef, useState} from "react";
import {NavLink, Outlet, useNavigate} from "react-router-dom";
import chatSvg from "../../assets/chat.svg";
import logoutSvg from "../../assets/right-from-bracket-solid.svg";
import './alumni.scss'
import {useImmer} from "use-immer";
import axios from "axios";
import {format} from "date-fns";
import {toast} from "react-toastify";

const Alumni = () => {
  const [pastResumeRequests, setPastResumeRequests] = useImmer([])
  const [pastReferralRequests, setPastReferralRequests] = useImmer([])
  const loginInfoRef = useRef();
  const [userInfo, setUserInfo] = useState({})
  const navigate = useNavigate();

  useEffect(() => {
    let loginInfo = JSON.parse(localStorage.getItem('login'));
    try {
      if (loginInfo && loginInfo.email && loginInfo.jwt) {
        loginInfoRef.current = (loginInfo)
        setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
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
        for (let i = 0; i < data.length; i++) {
          var date = new Date(data[i].timestamp * 1000);
          data[i].date = format(date, 'yyyy-MM-dd');
          if (data[i].sid_profile) {
            data[i].student = data[i].sid_profile.name
            data[i].profile = data[i].sid_profile.profile
            data[i].company = data[i].aid_profile.company
          }
        }
        setPastReferralRequests(data);
      } catch (e) {
        toast.error("Failed to get past requests!")
      }
    })();
    (async () => {
      try {
        let result = await axios.get('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/resume-requests?userId=' + loginInfo.email);
        let data = result.data.requests;
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          var date = new Date(data[i].timestamp * 1000);
          data[i].date = format(date, 'yyyy-MM-dd');
          if (data[i].sid_profile) {
            data[i].student = data[i].sid_profile.name
            data[i].profile = data[i].sid_profile.profile
          }
        }
        setPastResumeRequests(data);
      } catch (e) {
        toast.error("Failed to get past requests!")
      }
    })();
  }, [])

  // const changeOpenToRefer = (e) => {
  //   setUser({...user, openToRefer: e.target.value})
  // }
  //
  // const changeOpenToReview = (e) => {
  //   setUser({...user, openToReview: e.target.value})
  // }

  const changeRequestStatus = (type, index, newStatus) => {
    (async () => {
      try {
        const pastRequests = type === 'referral' ? pastReferralRequests : pastResumeRequests;
        const setRequests = type === 'referral' ? setPastReferralRequests : setPastResumeRequests;
        const request = {
          "userId": pastRequests[index].sid_profile.emailId,
          "alumniId": pastRequests[index].aid_profile.emailId,
          "timestamp": pastRequests[index].timestamp,
          "newStatus": newStatus
        }
        if (type === 'resume') {
          request.resumeId = pastRequests[index].rid
        }
        await axios.put(`https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/${type}-requests`, request);

        setRequests(reqs => {
          reqs[index].status = newStatus
        })
      } catch (e) {
        toast.error("Failed to update status!")
      }
    })();

  }

  const getStatusLabel = (rstatus) => {
    switch (rstatus) {
      case 'pending':
        return <div className={'status'} style={{color: '#fba505'}}>PENDING</div>
      case 'accepted':
        return <div className={'status'} style={{color: '#0a8800'}}>ACCEPTED</div>
      case 'completed':
        return <div className={'status'} style={{color: '#4b4b4b'}}>COMPLETED</div>
      case 'rejected':
        return <div className={'status'} style={{color: '#fd4040'}}>REJECTED</div>
      default:
        return <div className={'status'} style={{color: '#000000'}}>INVALID</div>
    }
  }

  const logOut = () => {
    localStorage.removeItem('login')
    navigate('/');
  }

  return (
    <div className={'alumni'}>
      <div className={'navbar'}>
        <div className={'logo'}>
          <span style={{color: '#6fa3bd', marginRight: '12px'}}>Columbia</span>
          <span style={{color: '#0033A0', marginRight: '12px'}}>Connect</span>
        </div>
        <div className={'right-btns'}>
          <div style={{fontWeight: '500', color: '#0033A0', marginRight: '20px'}}>
            <span style={{color: '#6fa3bd', marginRight: '5px'}}>Welcome</span>
            {userInfo && userInfo.name}!
          </div>
          <div className={'logout-btn'} onClick={logOut}>
            <img alt={'logout'} src={logoutSvg}/>
          </div>
          <div className={'chat-btn'}>
            <a href={'http://frontend-chat-app.s3-website-us-east-1.amazonaws.com/'} target={'_blank'}>
              <img alt={'chat'} src={chatSvg}/>
            </a>
          </div>
        </div>
        {/*<div className={'profile'}></div>*/}
      </div>
      <div className={'body'}>
        <div className={'welcome'}>
          Hello {userInfo.name}, Thank you so much for your contributions!
          Your efforts have helped the students a lot. You are a star!!!
        </div>
        {/*<div className={'preferences'}>*/}
        {/*  <div className={'pref'}>*/}
        {/*    <span>Are you open to giving referrals to students?</span>*/}
        {/*    <label style={{color: "#0033A0"}}><input type={'radio'} name={'referral'}*/}
        {/*                                             value={'yes'}*/}
        {/*                                             checked={user.openToRefer === 'yes'}*/}
        {/*                                             onChange={changeOpenToRefer}/>Yes</label>*/}
        {/*    <label style={{color: "#ff7373"}}><input type={'radio'} name={'referral'}*/}
        {/*                                             value={'no'}*/}
        {/*                                             checked={user.openToRefer === 'no'}*/}
        {/*                                             onChange={changeOpenToRefer}/>No</label>*/}
        {/*  </div>*/}
        {/*  <div className={'pref'}>*/}
        {/*    <span>Are you open to reviewing resumes?</span>*/}
        {/*    <label style={{color: "#0033A0"}}><input type={'radio'} name={'resume'}*/}
        {/*                                             value={'yes'}*/}
        {/*                                             checked={user.openToReview === 'yes'}*/}
        {/*                                             onChange={changeOpenToReview}/>Yes</label>*/}
        {/*    <label style={{color: "#ff7373"}}><input type={'radio'} name={'resume'}*/}
        {/*                                             value={'no'}*/}
        {/*                                             checked={user.openToReview === 'no'}*/}
        {/*                                             onChange={changeOpenToReview}/>No</label>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {
          pastReferralRequests.length > 0 &&
          <div className={'past'}>
            <div style={{fontSize: '24px', lineHeight: '29px', color: '#0033A0'}}>Referral requests</div>
            <table>
              <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Company</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {pastReferralRequests.map((request, index) => {
                return <tr key={index}>
                  <td>{request.date}</td>
                  <td>
                    <a href={request.profile} target={'_blank'}>
                      {request.student}
                    </a>
                  </td>
                  <td>{request.company}</td>
                  <td>{getStatusLabel(request.status)}</td>
                  <td>
                    {
                      request.status === 'pending' &&
                      <>
                        <label style={{color: "#0033A0"}}><input type={'checkbox'} name={`req-${index}`}
                                                                 value={'accepted'}
                                                                 checked={request.status === 'accepted'}
                                                                 onChange={() => changeRequestStatus('referral', index, 'accepted')}/>
                          Accept
                        </label>
                        <label style={{color: "#ff7373"}}><input type={'checkbox'} name={`req-${index}`}
                                                                 value={'rejected'}
                                                                 checked={request.status === 'rejected'}
                                                                 onChange={() => changeRequestStatus('referral', index, 'rejected')}/>
                          Reject
                        </label>
                      </>
                    }
                    {
                      request.status === 'accepted' &&
                      <label style={{color: "#4b4b4b"}}><input type={'checkbox'} name={`req-${index}`}
                                                               value={'completed'}
                                                               checked={request.status === 'completed'}
                                                               onChange={() => changeRequestStatus('referral', index, 'completed')}/>
                        Mark Completed
                      </label>
                    }
                    {
                      request.status === 'completed' &&
                      <span>Thank you :)</span>
                    }
                    {
                      request.status === 'rejected' &&
                      <span>We'll find a better match for you next time!</span>
                    }
                  </td>
                </tr>
              })}

              </tbody>
            </table>
          </div>
        }
        {
          pastResumeRequests.length > 0 &&
          <div className={'past'}>
            <div style={{fontSize: '24px', lineHeight: '29px', color: '#0033A0'}}>Resume requests</div>
            <table>
              <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {pastResumeRequests.map((request, index) => {
                return <tr key={index}>
                  <td>{request.date}</td>
                  <td>
                    <a href={request.profile}>
                      {request.student}
                    </a>
                  </td>
                  <td>
                    <a href={`https://resume-bucket-p1.s3.amazonaws.com/${request.rid}`} target={'_blank'}>
                      {request.rid}
                    </a>
                  </td>
                  <td>{getStatusLabel(request.status)}</td>
                  <td>
                    {
                      request.status === 'pending' &&
                      <>
                        <label style={{color: "#0033A0"}}><input type={'checkbox'} name={`req-${index}`}
                                                                 value={'accepted'}
                                                                 checked={request.status === 'accepted'}
                                                                 onChange={() => changeRequestStatus('resume', index, 'accepted')}/>
                          Accept
                        </label>
                        <label style={{color: "#ff7373"}}><input type={'checkbox'} name={`req-${index}`}
                                                                 value={'rejected'}
                                                                 checked={request.status === 'rejected'}
                                                                 onChange={() => changeRequestStatus('resume', index, 'rejected')}/>
                          Reject
                        </label>
                      </>
                    }
                    {
                      request.status === 'accepted' &&
                      <label style={{color: "#4b4b4b"}}><input type={'checkbox'} name={`req-${index}`}
                                                               value={'completed'}
                                                               checked={request.status === 'completed'}
                                                               onChange={() => changeRequestStatus('resume', index, 'completed')}/>
                        Mark Completed
                      </label>
                    }
                    {
                      request.status === 'completed' &&
                      <span>Thank you :)</span>
                    }
                    {
                      request.status === 'rejected' &&
                      <span>We'll find a better match for you next time!</span>
                    }
                  </td>
                </tr>
              })}

              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}

export default Alumni