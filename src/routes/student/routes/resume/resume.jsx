import React, {useEffect, useRef, useState} from "react";
import './resume.scss'
import axios from "axios";
import {toast} from "react-toastify";
import {format} from 'date-fns';
import FileBase64 from 'react-file-base64';

const Resume = () => {
  const defaultPastRequests = [
    {
      date: '04/11/2023',
      resume: 'Loop me',
      reviewer: 'John',
      status: 'pending',
    },
    {
      date: '04/01/2023',
      resume: 'Cool deed',
      reviewer: 'Jay',
      status: 'done',
    },
    {
      date: '04/11/2023',
      resume: 'Mr. X',
      reviewer: 'Avery',
      status: 'rejected',
    },
  ]
  const defaultReviewers = [
    {
      name: 'Avery',
      email: 'avery@columbia.edu'
    },
    {
      name: 'Uris',
      email: 'Uris@columbia.edu'
    },
    {
      name: 'Carlton',
      email: 'Carlton@columbia.edu'
    },
  ]
  const [reviewers, setReviewers] = useState(defaultReviewers)
  const [pastRequests, setPastRequests] = useState(defaultPastRequests)
  const [resumes, setResumes] = useState(['resume_ml.pdf', 'resume_cv.pdf'])
  const [selectedResume, setSelectedResume] = useState()
  const [selectedReviewer, setSelectedReviewer] = useState()
  const [userInfo, setUserInfo] = useState({})
  const keywordsRef = useRef()
  const loginInfoRef = useRef()

  // RESUME_SELECTION/REVIEWER_SELECTION
  const [resumeRequestStep, setResumeRequestStep] = useState('RESUME_SELECTION')

  useEffect(() => {
    // TODO: call user api to get resumes, request-balance
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
        // TODO: call resume-update api
        refreshUser()
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

    // TODO: fetch reviewers here

    setResumeRequestStep('REVIEWER_SELECTION');
  }

  const submitReviewRequest = () => {
    if (!selectedReviewer) {
      toast.error('Please select a reviewer to continue!')
      return
    }

    // TODO: connect api here
  }

  return (
    <div className={'resume'}>
      <div className={'request'}>
        <div className={'header'}>Request resume review</div>
        <div className={'body'}>
          <div className={'left-pane'}>
            {
              resumeRequestStep === 'RESUME_SELECTION' &&
              <div>
                <div className={'text'}>Choose a resume:</div>
                {
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
              <td>{request.resume}</td>
              <td>{request.reviewer}</td>
              <td>
                {getStatusLabel(request.status)}
              </td>
            </tr>
          })}

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Resume