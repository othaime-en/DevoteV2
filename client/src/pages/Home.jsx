import React, { useState, useEffect } from 'react'

import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context'

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [instances, setCampaigns] = useState([]);

  const { address, contract, getAllInstances } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getAllInstances();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <DisplayCampaigns 
      title="All Instances"
      isLoading={isLoading}
      campaigns={instances}
    />
  )
}

export default Home