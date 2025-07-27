import NavBar from "~/component/NavBar";
import {type FormEvent, useState} from "react";
import FileUploader from "~/component/FileUploader";
import * as fs from "node:fs";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdfToImg";
import {generatedUUID} from "~/lib/utils";
import {stringify} from "postcss";
import * as path from "node:path";
import {prepareInstructions} from "~/constants";

const upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze = async ({companyName , jobTitle, jobDescription,file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) =>{
        setIsProcessing(true);
        setStatusText('uploading the file...');
        const uploadedFile= await fs.upload([file])
        if(!uploadedFile){
            return setStatusText('Error: upload failed.');
        }
        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file){
            return setStatusText('Error: failed to convert pdf to image.');
        }

        setStatusText('Uploading the image...');

        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage){
            setStatusText('Error: failed to upload the image.');
        }

        setStatusText('Preparing data...');

        const uuid = generatedUUID();

        const data ={
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage?.path,
            companyName,jobTitle,jobDescription,
            feedback: '',
        }
        await kv.set(`resume: ${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');
        const  feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle,jobDescription}),
        )
        if(!feedback){
            return setStatusText('Error: Failed to analyse the resume.');
        }
        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;
        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume: ${uuid}` , JSON.stringify(data));
        setStatusText('Analysis Complete, redirecting...');
        console.log(data);
    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        const form: HTMLFormElement | null = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);
        const companyName= formData.get("company-name") as string;
        const jobTitle= formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({companyName, jobTitle, jobDescription, file});
    }
    return (
        <main className="bg-[url('/bg.main.svg')] bg-cover">
            <NavBar/>
            <section className="main-section">
                <div className="page-heading py-10">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" alt="scan"/>
                        </>
                    ):(
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Job Title</label>
                                    <input name="company-name" type="text" placeholder="Company Name" id="company-name"/>

                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                    <input name="job-title" type="text" placeholder="Job Title" id="job-title"/>
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea name="job-description" rows={5} placeholder="Job Description" id="job-description"/>
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>
                            <div className="primary-button">
                                <button className="cursor-pointer">Analyse</button>
                            </div>
                        </form>
                    )}
                </div>
            </section>

        </main>
    )
}
export default upload;