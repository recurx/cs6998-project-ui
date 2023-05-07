import React, {useEffect, useRef, useState} from "react";
import './referral.scss'
import axios from "axios";
import {toast} from "react-toastify";
import {format} from 'date-fns';

const Referral = () => {
  const [referrers, setReferrers] = useState([])
  const [pastRequests, setPastRequests] = useState([])
  const [userInfo, setUserInfo] = useState({})

  const companyRef = useRef()
  const keywordRef = useRef()

  useEffect(() => {
    getPastRequests()
    refreshUser()
  }, [])

  const refreshUser = () => {
    (async () => {
      try {
        let loginInfo = JSON.parse(localStorage.getItem('login'));
        let result = await axios.get('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/user-profile?userId=' + loginInfo.email);
        let user = result.data.requests;
        localStorage.setItem('userInfo', JSON.stringify(user));
        setUserInfo(user)
      } catch (e) {
        toast.error("Failed!")
      }
    })();
  }

  const getPastRequests = () => {
    let loginInfo = JSON.parse(localStorage.getItem('login'));
    (async () => {
      try {
        let result = await axios.get('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/referral-requests?userId=' + loginInfo.email);
        let data = result.data.requests;
        for (let i = 0; i < data.length; i++) {
          var date = new Date(data[i].timestamp * 1000);
          data[i].date = format(date, 'yyyy-MM-dd');
          if (data[i].aid_profile) {
            data[i].referrer = data[i].aid_profile.name
            data[i].company = data[i].aid_profile.company
          }
        }
        setPastRequests(data);
      } catch (e) {
        toast.error("Failed to get past requests!")
      }
    })();
  }

  const askReferral = (referrer) => {
    (async () => {
      try {
        let loginInfo = JSON.parse(localStorage.getItem('login'));
        const req = {
          userId: loginInfo.email,
          reviewers: [referrer.emailId]
        }
        await axios.post('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/referral-requests', req)
        getPastRequests()
        refreshUser()
      } catch (e) {
        toast.error('Failed to submit request! ' + e.message)
      }
    })()

  }

  const searchReferrers = () => {
    if (keywordRef.current.value === '') {
      toast.error('Add keywords to search!')
      return
    }
    const company = companyRef.current.value
    const req = {
      'keywords': keywordRef.current.value,
    };
    if (company !== '') {
      req.company = company
    }

    (async () => {
      try {
        const resp = await axios.post('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/search', req)
        setReferrers(resp.data.body)
      } catch (e) {
        toast.error("Failed to fetch reviewers!")
      }
    })()
  }

  const getStatusLabel = (rstatus) => {
    console.log("here")
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

  return (
    <div className={'referral'}>
      <div className={'request'}>
        <div style={{fontSize: '20px', lineHeight: '24px', color: '#0033A0'}}>
          Request Referral ({userInfo.referralsRemaining} remaining)
        </div>
        <div style={{fontSize: '16px', lineHeight: '19px', color: '#000000', marginTop: '30px'}}>
          Add filtering details:
        </div>
        <div className={'filters'}>
          <div className={'filter'}>
            <div style={{fontSize: '15px'}}>Company</div>
            <input type={'text'} ref={companyRef} placeholder={'Enter a company like \'Google\''}/>
          </div>
          <div className={'filter'}>
            <div style={{fontSize: '15px'}}>Keywords</div>
            <input type={'text'} ref={keywordRef} placeholder={'Enter keywords like \'Software,ml,data\''}/>
          </div>
          <button onClick={searchReferrers}>Search</button>
        </div>
        {
          referrers.length > 0 ?
            <table>
              <thead>
              <tr>
                <th>Referrer</th>
                <th>Company</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              {referrers.map((referrer, index) => {
                return <tr key={index}>
                  <td>{referrer.name}</td>
                  <td>{referrer.company}</td>
                  <td>
                    <button onClick={() => askReferral(referrer)} style={{width: '90%', cursor: 'pointer'}}>Ask
                      referral
                    </button>
                  </td>
                </tr>
              })}

              </tbody>
            </table>
            :
            ''
        }

      </div>
      {
        pastRequests && pastRequests.length > 0 &&
        <div className={'past'}>
          <div style={{fontSize: '24px', lineHeight: '29px', color: '#0033A0'}}>Past requests</div>
          <table>
            <thead>
            <tr>
              <th>Date</th>
              <th>Referrer</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {pastRequests.map((request, index) => {
              return <tr key={index}>
                <td>{request.date}</td>
                <td>{request.referrer}</td>
                <td>{request.company}</td>
                <td>
                  {getStatusLabel(request.status)}
                </td>
              </tr>
            })}

            </tbody>
          </table>
        </div>
      }
    </div>
  )
}

export default Referral