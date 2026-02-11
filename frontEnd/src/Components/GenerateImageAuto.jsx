import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "../ReusableComponents/Input";
import Button from "../ReusableComponents/Button";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "./Container/Container";

function GenerateImageAuto() {
  const navigate = useNavigate();
  const [videoTranscript, setVideoTranscript] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Form 1: For fetching transcript
  const {
    register: registerUrl,
    handleSubmit: handleSubmitUrl,
    reset: resetUrl,
    formState: { errors: errorsUrl },
  } = useForm();

  // Form 2: For generating image
  const {
    register: registerContent,
    handleSubmit: handleSubmitContent,
    setValue: setValueContent,
    formState: { errors: errorsContent },
  } = useForm();

  const onAutoImageHandler = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/users/generateAiImage", data);
      if (response.status === 200) {
        toast.success("Transcript Fetched Successfully");
        setLoading(false);

         setVideoTranscript(response?.data?.data.data.map((item) => item.text));
         const transcriptText = response?.data?.data.data.map((item) => item.text)
        // Fix: Extract text directly from the transcript object
      
        
        
        setVideoTranscript(transcriptText);
        setValueContent("Content", transcriptText);
        resetUrl();
      }
      return response?.data?.data.data;
      return response?.data?.data;
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  // console.log(videoTranscript);

  const imageGenerateWithTranscript = async (data) => {
    setImageLoading(true);
    
    // Ensure we send a string. If videoText is an array, join it.
   
    try {
      const response = await axios.post(
        "/api/v1/users/generateImagewithTranscript",
        data, // Fix: Send as an object with 'transcript' key
      );
      if (response.status === 200) {
        console.log("Image url received :", response.data.data);
        setGeneratedImage(response.data.data);
        toast.success("Image Generated Successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to generate Image");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <Container>
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-base-content tracking-tight sm:text-4xl">
              Generate Content from Video
            </h2>
            <p className="mt-4 text-lg text-base-content/70">
              Enter a YouTube video URL to fetch the transcript and generate AI
              images.
            </p>
          </div>

          <div className="bg-base-100 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-base-300">
            <form
              className="space-y-6"
              onSubmit={handleSubmitUrl(onAutoImageHandler)}
            >
              <div>
                <Input
                  label="Video URL"
                  placeholder="Paste YouTube link here..."
                  className="block w-full rounded-lg border border-base-300 px-4 py-3 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out bg-base-100"
                  {...registerUrl("videoUrl", { required: true })}
                />
                {errorsUrl.videoUrl && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    Video URL is required
                  </p>
                )}
              </div>

              <Button
                children={loading ? "Fetching Transcript..." : "Get Transcript"}
                type="submit"
                className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={loading}
              />
            </form>
          </div>

          {/* Transcript Display Section */}
          <div className="bg-base-100 shadow-2xl sm:rounded-xl border border-base-300 overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-base-200 border-b border-base-300 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-base-content">
                Transcript Data
              </h3>
             
            </div>

            <div className="px-4 py-5 sm:p-6 h-64 overflow-y-auto bg-base-200/50">
              {videoTranscript ? (
                <div className="space-y-4">{videoTranscript}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-base-content/40">
                  <svg
                    className="w-12 h-12 mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>No transcript loaded yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Gemini Image  */}
          <div className="bg-base-100 shadow-2xl sm:rounded-xl border border-base-300 overflow-hidden mt-6">
            
            <div className="px-4 py-5 sm:px-6 bg-base-200 border-b border-base-300">
              <h3 className="text-lg leading-6 font-medium text-base-content mb-4">
                Generate AI Image
              </h3>
              <form onSubmit={handleSubmitContent(imageGenerateWithTranscript)} className="space-y-4">
                <div>
                  <textarea
                    rows={6}
                    className="block w-full rounded-lg border border-base-300 px-4 py-3 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out resize-y bg-base-100"
                    placeholder="Transcript content will appear here..."
                    {...registerContent("Content", { required: true })}
                  />
                </div>

                <Button
                  className="w-full flex justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  children={imageLoading ? "Generating Image..." : "Generate Image"}
                  type="submit"
                  disabled={imageLoading}
                />
              </form>
            </div>
            <div className="flex justify-center items-center p-4 min-h-[500px] bg-base-200/50">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated AI"
                  className="w-full h-auto max-h-[600px] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-base-300 rounded-lg p-12">
                  <p className="text-base-content/50">
                    {imageLoading
                      ? "Creating magic..."
                      : "Image will be displayed here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default GenerateImageAuto;
