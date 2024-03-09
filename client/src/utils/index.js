export const hoursLeft = (unixTime) => {
  const now = Date.now();
  const targetTime = unixTime * 1000;
  const differenceInMilliseconds = targetTime - now;
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

  return differenceInHours.toFixed(0);
};

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
