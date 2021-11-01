import useEffectOnce from './useEffectOnce';

//https://github.com/streamich/react-use/blob/master/src/useMount.ts
const useMount = (fn) => {
  useEffectOnce(() => {
    fn();
  });
};

export default useMount;
