declare let process: {
  env: {
    REACT_APP_NAME: string;
    REACT_APP_API_URL: string;
  };
};
// vite-env.d.ts
interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
}
