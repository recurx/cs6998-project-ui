/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from 'amazon-chime-sdk-component-library-react';

import './ChannelModals.css';

export const ViewChannelDetailsModal = ({ onClose, channel, moderators, channelFlow}) => {
  const modNames = moderators.map((m) => (
    <div key={m.Moderator.Arn}>{m.Moderator.Name}</div>
  ));

  return (
    <Modal onClose={onClose} className="view-details">
      <ModalHeader title="Channel Details" />
      <ModalBody>
        <div className="container">

        {!channel.SubChannelId && (
          <>
          <div className="row">
            <div className="key">Channel Name</div>
            <div className="value">{channel.Name}</div>
          </div>

          {moderators.length > 0 ? (
            <div className="row">
              <div className="key">Moderators</div>
              <div className="value">{modNames}</div>
            </div>
          ) : null}

          <div className="row">
            <div className="key">Privacy</div>
            <div className="value">
              {channel.Privacy === 'PRIVATE' && (
                <span>
                  <span className="main">Private</span>
                  <span className="detail">
                    (non-members can read and send messages)
                  </span>
                </span>
              )}
              {channel.Privacy === 'PUBLIC' && (
                <span>
                  <span className="main">Public</span>
                  <span className="detail">
                    (only members can read and send messages)
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="row">
            <div className="key">Mode</div>
            <div className="value">
              {channel.Mode === 'RESTRICTED' && (
                <span>
                  <span className="main">Restricted</span>
                  <span className="detail">
                    (administrators and moderators can add members)
                  </span>
                </span>
              )}
              {channel.Mode === 'UNRESTRICTED' && (
                <span>
                  <span className="main">Unrestricted</span>
                  <span className="detail">
                    (any member can add other members)
                  </span>
                </span>
              )}
            </div>
          </div>
          </>
        )}
        
        {channel.SubChannelId && (
          <>          
          <div className="row">
            <div className="key">Sub Channel Id</div>
            <div className="value">{channel.SubChannelId}</div>
          </div>
          <div className="row">
            <div className="key">Members Count</div>
            <div className="value">{channel.MembershipCount}</div>
          </div> 
        </>
          )}

          {channel.ElasticChannelConfiguration && (
            <>
            <div className="row">
              <div className="key">Maximum SubChannels</div>
              <div className="value">{channel.ElasticChannelConfiguration.MaximumSubChannels}</div>
            </div> 

            <div className="row">
              <div className="key">Target Memberships Per SubChannel</div>
              <div className="value">{channel.ElasticChannelConfiguration.TargetMembershipsPerSubChannel}</div>
            </div> 

            <div className="row">
              <div className="key">Scale-In Minimum Memberships(%)</div>
              <div className="value">{channel.ElasticChannelConfiguration.MinimumMembershipPercentage}</div>
            </div> 
            </>
          
          )}

        {!channel.SubChannelId && !channel.ElasticChannelConfiguration && (
          <div className="row">
          <div className="key">Channel Flow</div>
          <div className="value">
            {channel.ChannelFlowArn == null ?
              <span>
                <span className="main">No flow configured</span>
              </span>
              :
              <span>
                <span className="main">{channelFlow.Name}</span>
              </span>
            }
          </div>
          </div>
          )
        }
        </div>  
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton label="OK" variant="primary" closesModal />,
        ]}
      />
    </Modal>
  );
};

export default ViewChannelDetailsModal;
