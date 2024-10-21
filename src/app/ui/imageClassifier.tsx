"use client";

import { useState, useRef, useEffect } from "react";

export default function ImageClassifier() {
    const [file, setFile] = useState<File | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [response, setResponse] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const analyzeMeal = async (selectedFile: File) => {
        setSubmitted(true);
        setResponse(""); // Clear previous response

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("/api/classify", {
                method: "POST",
                body: formData,
            });

            const reader = res.body?.getReader();
            if (!reader) throw new Error("Failed to get reader");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder("utf-8").decode(value);
                console.log("Received chunk:", chunk); // Log the chunk for debugging
                setResponse((prev) => prev + chunk);
            }
        } catch (error) {
            console.error("Error:", error);
            setResponse("An error occurred while processing the image.");
        } finally {
            setSubmitted(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setImage(URL.createObjectURL(selectedFile));
            analyzeMeal(selectedFile);
        }
    };

    useEffect(() => {
        // Clean up object URL when component unmounts or image changes
        return () => {
            if (image) {
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-black text-white p-4">
            <div className="w-full max-w-4xl flex flex-col items-center justify-between h-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">Calorie AI</h1>
                    <p className="text-xl text-gray-300">Forget the scales, just snap a photo of your meal and we&apos;ll tell you how many calories is in it. Powered by OpenAI.</p>
                </div>

                <div className="flex flex-col items-center w-full mb-8">
                    <label htmlFor="file-upload" className="mb-6 cursor-pointer">
                        <span className="bg-white text-black font-bold py-3 px-6 rounded-full transition duration-300 hover:bg-gray-200">
                            Analyse Meal
                        </span>
                        <input
                            id="file-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    {image && (
                        <img
                            src={image}
                            alt="Meal to classify"
                            className="mb-6 max-w-full h-auto max-h-64 object-contain rounded-lg shadow-lg"
                        />
                    )}
                </div>

                <div className="w-full p-6 bg-white bg-opacity-10 rounded-lg shadow-xl overflow-y-auto max-h-64">
                    {submitted ? (
                        <p className="text-center text-xl">Analyzing your meal...</p>
                    ) : (
                        response.split('\n').map((line, index) => (
                            <p key={index} className="text-lg mb-2">{line}</p>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
