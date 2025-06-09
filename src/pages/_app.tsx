import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import { TaskProvider } from '~/context/TaskContext';
import { AuthProvider } from "~/contexts/AuthContext";

import "~/styles/globals.css";

const MyApp: AppType = ({
  Component,
  pageProps,
}) => {
  return (
    <AuthProvider>
      <TaskProvider>
        <div className={GeistSans.className}>
          <Component {...pageProps} />
        </div>
      </TaskProvider>
    </AuthProvider>
  );
};

export default MyApp;
