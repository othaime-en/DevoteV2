import React, { useContext, createContext } from 'react';
import myContract from '../contract.js';

import { useAddress, useContract, useMetamask, useContractWrite, useContractRead } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0x51D0C0F930eFa8aaA3FdD728a433BCEECD957c40');
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
  const { mutateAsync: createInstanceCall } = useContractWrite(contract, "createInstance");
  const { mutateAsync: addCandidatesCall } = useContractWrite(contract, "addCandidates");


  const address = useAddress();
  const connect = useMetamask();

 // Function to create a voting instance
 const createNewInstance = async (instanceName, organizationName, description) => {
  
  try {
    const data = await createInstanceCall({ args: [instanceName, organizationName, description] });
    console.info("Instance creation success", data);
    const value = data.receipt.logs[0].topics[1];
    const instanceId = ethers.BigNumber.from(value).toNumber();
    console.log("The instanceId is: ", instanceId)
    return instanceId; // This should include instance ID or related data from your contract's response
  } catch (error) {
    console.error("Instance creation failure", error);
    throw error; // Re-throw the error to handle it in the component
  }
};

// Function to add candidates to a voting instance
const addCandidates = async (instanceId, candidates) => {
  try {
    const names = candidates.map(c => c.name);
    const roles = candidates.map(c => c.role);
    const descriptions = candidates.map(c => c.description);
    const data = await addCandidatesCall({ args: [instanceId, names, roles, descriptions] });
    console.info("Adding candidates success", data);
  } catch (error) {
    console.error("Adding candidates failure", error);
    throw error; // Re-throw the error to handle it in the component
  }
};

// Function to query the number of instances
const getNumberOfInstances = async () => {
  const data = await contract.call("instanceId")
  const instanceIds = ethers.BigNumber.from(data).toNumber()
  
  console.log("The number of instances is: ", instanceIds)
  return instanceIds;
}

// const getInstances = async (count) => {
//   const { instance, isLoading } = useContractRead(contract, "instances", [count])
//   return instance;
// }

// Function to get all the instances.
const getAllInstances = async () => {
  const count = await getNumberOfInstances();
  const instances = [];
  for (let i = 1; i <= count; i++) {
    const instance = await contract.call("instances", [i])
    instances.push(instance);
  }
  console.log("Here are the instances: ",instances)
  const parsedInstances = instances.map((instance, i) => ({
    instanceId: instance.id.toNumber(),
    title: instance.name,
    organizationName: instance.organizationName,
    description: instance.description,
    owner: instance.creator,
    candidateCount: instance.candidateCount.toNumber(),
    instanceStatus: instance.status,
    startTime: instance.startTime.toNumber(),
    endTime: instance.endTime.toNumber(),
    isPrivate: instance.isPrivate,
  }))
  console.log("Here are the parsed instances: ",parsedInstances)
  return parsedInstances;
}

const getUserInstances = async () => {
  const allCampaigns = await getAllInstances();

  const filteredCampaigns = allCampaigns.filter((instance) => instance.owner === address);

  return filteredCampaigns;
}

const getCandidates = async (instanceId) => {
  const data = await contract.call("getCandidates", [instanceId]);

  const parsedCandidates = data.map((candidate, i) => ({
    candidateId: candidate.id.toNumber(),
    name: candidate.name,
    role: candidate.role,
    description: candidate.description,
    voteCount: candidate.voteCount.toNumber(),
    pId: i
  }))
  console.log("Here are the parsed candidates: ", parsedCandidates)
  return parsedCandidates;
}

const vote = async (instanceId, candidateId) => {
  try {
    const data = await contract.call("vote", [instanceId, candidateId])

    console.info("Successful voting process", data);
  } catch (error) {
    console.error("There was an error in your voting process", error);
    throw error; // Re-throw the error to handle it in the component
  }
}




  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
				args: [
					address, // owner
					form.title, // title
					form.description, // description
					form.target,
					new Date(form.deadline).getTime(), // deadline,
					form.image,
				],
			});

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});

    return data;
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }


  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createNewInstance,
        addCandidates,
        getNumberOfInstances,
        getAllInstances,
        getUserInstances,
        getCandidates,
        vote,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);