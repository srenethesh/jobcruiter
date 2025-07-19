import type { Route } from "./+types/home";
import NavBar from "~/component/NavBar";
import {resumes} from "~/constants";
import ResumeCard from "~/component/ResumeCard";
import resumeCard from "~/component/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Jobcruiter", description: "Jobcruit's Name", type: "string" },
    { name: "description", content: "AI-Powered Resume Analysis to Help You Get Hired" },
  ];
}

export default function Home() {
  const {auth} = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  },[auth.isAuthenticated])

  return <main className="bg-[url('/bg.main.svg')] bg-cover">
    <NavBar/>

    <section className="main-section">
      <div className="page-heading py-8">
        <h1>AI-Powered Resume Analysis to Help You Get Hired</h1>
        <h2>Drop your resume for an ATS score and improvement tips</h2>
      </div>
    </section>
    {resumes.length>0 && (
        <div className="resumes-section">
        {resumes.map((resume) =>(
            <ResumeCard key={resume.id} resume={resume}/>
        ))}
        </div>
    )}
  </main>
}
