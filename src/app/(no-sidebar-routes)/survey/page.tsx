'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';

const SurveyPage = () => {
    const searchParams = useSearchParams();
    const urlParams = searchParams.toString();
    const baseUrl = "https://amatra-survey.vercel.app/";
    const fullUrl = urlParams ? `${baseUrl}?${urlParams}` : baseUrl;

    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <iframe
                src={fullUrl}
                title="Athlete Survey"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'var(--dark-purple-1)'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    )
}

export default SurveyPage;