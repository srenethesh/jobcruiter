import {usePuterStore} from "~/lib/puter";
import {use, useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

export const metaData = () => ([
    { title: 'Jobcruiter | Auth'},
    {name: 'description', content: 'Log into your account'}
])

const auth = () => {
    const {isLoading, auth} = usePuterStore();
    const location = useLocation();
    const next = location.search.split("next=")[1];
    const navigate = useNavigate();
    useEffect(() => {
        if(auth.isAuthenticated) navigate(next);
    },[auth.isAuthenticated,next])

    return(
        <main
            className="bg-[url('/bg.main.svg')] bg-cover min-h-screen flex items-center justify-center"
        >
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col text-center gap-2 items-center justify-center">
                        <h1>Welcome</h1>
                        <h2>Log In to continue your job journey</h2>
                    </div>
                    <div>
                        {isLoading ? (
                            <button className="auth-button animate-pulse">
                                <p>Signing you in...</p>
                            </button>
                        ):(
                            <>
                                {auth.isAuthenticated ? (
                                    <button className="auth-button" onClick={auth.signOut}>Log Out</button>
                                ):(
                                    <button className="auth-button" onClick={auth.signIn}>Log In</button>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
export default auth;