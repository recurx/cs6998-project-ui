import React, {useEffect, useRef, useState} from "react";
import './resume.scss'
import axios from "axios";
import {toast} from "react-toastify";
import {format} from 'date-fns';
import FileBase64 from 'react-file-base64';
import linkedinSvg from "../../../../assets/linkedin.svg"

const Resume = () => {
  const [reviewers, setReviewers] = useState([])
  const [pastRequests, setPastRequests] = useState([])
  const [resumes, setResumes] = useState(['resume_ml.pdf', 'resume_cv.pdf'])
  const [selectedResume, setSelectedResume] = useState()
  const [selectedReviewer, setSelectedReviewer] = useState()
  const [userInfo, setUserInfo] = useState({})
  const keywordsRef = useRef()

  // RESUME_SELECTION/REVIEWER_SELECTION
  const [resumeRequestStep, setResumeRequestStep] = useState('RESUME_SELECTION')

  useEffect(() => {
    refreshUser()
    getPastRequests()
  }, [])

  const getPastRequests = () => {
    let loginInfo = JSON.parse(localStorage.getItem('login'));
    (async () => {
      try {
        let result = await axios.get('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/resume-requests?userId=' + loginInfo.email);
        let data = result.data.requests;
        for (let i=0; i<data.length; i++) {
          var date = new Date(data[i].timestamp * 1000);
          data[i].date = format(date, 'yyyy-MM-dd');
          if (data[i].aid_profile) {
            data[i].reviewer = data[i].aid_profile.name
          }
        }
        setPastRequests(data);
      } catch (e) {
        toast.error("Failed to get past requests!")
      }
    })();
  }

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

  const selectResume = (event) => {
    setSelectedResume(event.target.value)
  }

  const selectReviewer = (reviewer) => {
    setSelectedReviewer(reviewer)
  }

  const updateUserResume = (rid) => {
    let email = JSON.parse(localStorage.getItem('login')).email;
    return axios.post('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/upload-resume', {
      'userId': email,
      'resumeId': rid
    })
      .then((response) => {
        console.log('Upload Api success!', response);
        refreshUser()
      })
      .catch((error) => {
        console.error('Error updating resume!', error);
        toast("Resume upload failed!")
      });
  }

  const uploadToS3 = (e) => {
    if (e.target.files.length === 0) {
      return
    }
    let file = e.target.files[0]
    var blob = file.slice(0, file.size, file.type);
    file = new File([blob], new Date().getTime() + '_' + file.name, {type: file.type});
    const config = {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        const {loaded, total} = progressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        console.log(`${percentCompleted}% uploaded`);
      }
    };
    console.log(file)

    const url = 'https://wexa2c5ut9.execute-api.us-east-1.amazonaws.com/v1/upload/resume-bucket-p1/' + file.name;

    return axios.put(url, file, config)
      .then((response) => {
        console.log('File uploaded to s3 successfully!', response);
        updateUserResume(file.name)
      })
      .catch((error) => {
        console.error('Error uploading file!', error);
        toast("Resume upload failed!")
      });
  };


  const continueToReviewerSel = () => {
    if (keywordsRef.current.value === '' || !selectedResume) {
      toast.error('Please select a resume and fill in keywords to continue!')
      return
    }

    (async () => {
      try {
        const resp = await axios.post('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/search', {
          'keywords': keywordsRef.current.value,
        })
        setReviewers(resp.data.body)
        setResumeRequestStep('REVIEWER_SELECTION');
      } catch (e) {
        toast.error("Failed to fetch reviewers!")
      }
    })()
  }

  const submitReviewRequest = () => {
    if (!selectedReviewer) {
      toast.error('Please select a reviewer to continue!')
      return
    }
    (async () => {
      try {
        let loginInfo = JSON.parse(localStorage.getItem('login'));
        const req = {
          userId: loginInfo.email,
          resumeId: selectedResume,
          reviewers: [selectedReviewer.emailId]
        }
        await axios.post('https://n4dcx9l98a.execute-api.us-east-1.amazonaws.com/v1/resume-requests', req)
        setResumeRequestStep('RESUME_SELECTION')
        refreshUser()
        getPastRequests()
      } catch (e) {
        toast.error('Failed to submit request! ' + e.message)
      }
    })()
  }

  return (
    <div className={'resume'}>
      <div className={'request'}>
        <div className={'header'}>Request resume review ({userInfo.resumeReviewRemaining} remaining)</div>
        <div className={'body'}>
          <div className={'left-pane'}>
            {
              resumeRequestStep === 'RESUME_SELECTION' &&
              <div>
                <div className={'text'}>Choose a resume:</div>
                {
                  userInfo &&
                  userInfo.resumes &&
                  userInfo.resumes.length > 0 &&
                  userInfo.resumes.map(resume =>
                    <div className={'radio-pane'}>
                      <label>
                        {resume}
                        <input
                          type={'radio'}
                          value={resume}
                          name={'resume'}
                          checked={selectedResume === resume}
                          onChange={selectResume}
                        />
                      </label>
                    </div>
                  )
                }
                {
                  resumes.length < 5 &&
                  <div className={'upload-box'}>
                    <label>
                      + Upload resume
                      <input style={{display: 'none'}} type="file" onChange={uploadToS3}/>
                    </label>
                  </div>
                }
              </div>
            }
            {
              resumeRequestStep === 'RESUME_SELECTION' &&
              <div className={`btn`} onClick={continueToReviewerSel}>Continue</div>
            }
            {
              resumeRequestStep === 'REVIEWER_SELECTION' &&
              <div>
                <div className={'text'}>Choose a reviewer:</div>
                {
                  reviewers && reviewers.length > 0 &&
                  reviewers.map(reviewer =>
                    <div className={'radio-pane'}>
                      <label>
                        {reviewer.name}
                        <input
                          type={'radio'}
                          value={reviewer.name}
                          name={'resume'}
                          checked={selectedReviewer === reviewer}
                          onChange={() => selectReviewer(reviewer)}
                        />
                      </label>
                      <a href={reviewer.profile} target={'_blank'}>
                        <img alt={'linkedin'} src={linkedinSvg}/>
                      </a>
                    </div>
                  )
                }
              </div>
            }
            {
              resumeRequestStep === 'REVIEWER_SELECTION' &&
              <div className={`btn`} onClick={submitReviewRequest}>Submit request</div>
            }
          </div>
          {
            resumeRequestStep === 'RESUME_SELECTION' &&
            <div className={'right-pane'}>
              <div className={'text'}>Add keywords:</div>
              <div>
                <input type={'text'} ref={keywordsRef}/>
              </div>
            </div>
          }
        </div>
      </div>
      {
        pastRequests &&
        pastRequests.length > 0 &&
        <div className={'past'}>
          <div style={{fontSize: '24px', lineHeight: '29px', color: '#0033A0'}}>Past requests</div>
          <table>
            <thead>
            <tr>
              <th>Date</th>
              <th>Resume</th>
              <th>Reviewer</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {pastRequests.map((request, index) => {
              return <tr key={index}>
                <td>{request.date}</td>
                <td>
                  <a href={`https://resume-bucket-p1.s3.amazonaws.com/${request.rid}`} target={'_blank'}>
                    {request.rid}
                  </a>
                </td>
                <td>
                  <a href={request.aid_profile && request.aid_profile.profile} target={'_blank'}>
                    {request.reviewer}
                  </a>
                </td>
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

export default Resume