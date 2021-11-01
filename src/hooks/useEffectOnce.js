import { useEffect } from 'react';

//https://github.com/streamich/react-use/blob/master/src/useEffectOnce.ts
const useEffectOnce = (effect) => {
  useEffect(effect, []);
};

export default useEffectOnce;
