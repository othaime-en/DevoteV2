import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { Lumiflex, Zenitho, Novatrix } from "uvcanvas";

import { useStateContext } from "../context";
import { CountBox, CustomButton, Loader } from "../components";
import { calculateBarPercentage, hoursLeft } from "../utils";
import { thirdweb } from "../assets";

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address, getCandidates, vote } =
    useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [uniqueRoles, setUniqueRoles] = useState([]);

  const remainingHours = hoursLeft(state.endTime);

  const fetchCandidates = async () => {
    const data = await getCandidates(state.instanceId);

    setCandidates(data);
  };

  useEffect(() => {
    if (contract) fetchCandidates();
  }, [contract, address]);

  useEffect(() => {
    const roles = candidates.reduce((acc, candidate) => {
      const { role } = candidate;
      if (!acc.includes(role)) {
        acc.push(role);
      }
      return acc;
    }, []);

    setUniqueRoles(roles);
    setSelectedRole(roles[0] || ''); // Automatically select the first role, if available
  }, [candidates]);

  const handleVote = async () => {
    setIsLoading(true);

    await vote(state.instanceId, selectedName);

    navigate("/");
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <Novatrix
            alt="campaign"
            className="w-full h-[410px] object-cover rounded-[15px]"
          />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#4acd8d]"
              style={{
                width: `${calculateBarPercentage(
                  state.startTime,
                  state.endTime
                )}%`,
                maxWidth: "100%",
              }}
            ></div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Hours Left" value={remainingHours} />
          <CountBox title="Candidates" value={state.candidateCount} />
          <CountBox title="Total Votes" value="1" /*{candidates.length}*/ />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Creator
            </h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img
                  src={thirdweb}
                  alt="user"
                  className="w-[60%] h-[60%] object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {state.owner}
                </h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">
                  10 Campaigns
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              {state.title}
            </h4>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Description
            </h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {state.description}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Candidates
            </h4>

            <div>
              <div className="mt-[20px] flex flex-col gap-4">
                {candidates.length > 0 ? (
                  candidates.map((candidate, index) => (
                    <div
                      key={candidate.candidateId}
                      className="bg-[#1c1c24] p-4 rounded-[10px]"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-epilogue font-semibold text-[16px] text-white">
                          {index + 1}. {candidate.name}
                        </p>
                        <p className="font-epilogue font-medium text-[14px] text-[#b2b3bd]">
                          {candidate.role}
                        </p>
                      </div>
                      <p className="font-epilogue font-normal text-[14px] text-[#808191] mt-2">
                        {candidate.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                    No Candidates added yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
            Vote
          </h4>

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Vote on this Instance
            </p>
            <div className="mt-[30px]">
            {/* Role selection */}
          <select
            className="w-full py-[10px] mb-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-[#2a2a35] font-epilogue text-white text-[18px] leading-[30px] rounded-[10px]"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ backgroundColor: '#2a2a35', color: 'white'}}
          >
            {uniqueRoles.map(role => (
              <option key={role} value={role} style={{ backgroundColor: '#2a2a35', color: 'white'}}>
                {role}
              </option>
            ))}
          </select>

          {/* Candidate selection based on the selected role */}
          <select
            className="w-full py-[10px] mb-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-[#2a2a35] font-epilogue text-white text-[18px] leading-[30px] rounded-[10px]"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            style={{ backgroundColor: '#2a2a35', color: 'white'}}
          >
            {candidates.filter(candidate => candidate.role === selectedRole).map(candidate => (
              <option key={candidate.candidateId} value={candidate.name} style={{ backgroundColor: '#2a2a35', color: 'white'}}>
                {candidate.name}
              </option>
            ))}
          </select>

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Vote for who you believe in.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Support the candidate of your choice, just because the
                  resonate with you.
                </p>
              </div>

              <CustomButton
                btnType="button"
                title="Vote Now"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleVote}
              />
            </div>
          </div>
          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <div className="mt-[20px]">
              <div className="my-[10px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Vote for who you believe in.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Support the candidate of your choice, just because the
                  resonate with you.
                </p>
              </div>

              <CustomButton
                btnType="button"
                title="Get Vote Count"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleVote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
