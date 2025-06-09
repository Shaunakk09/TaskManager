import Head from "next/head";
import Navbar from "../components/layout/Navbar";
import TaskManager from "../components/task/TaskManager";

export default function Home() {
  return (
    <>
      <Head>
        <title>EasySLR - Task Manager</title>
        <meta name="description" content="Manage your tasks efficiently with EasySLR" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="bg-gray-50 min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <TaskManager />
      </main>
    </>
  );
}


