import React from 'react'
import Container from './Container/Container.jsx'

function About() {
  return (
    <Container>
      <div className="py-12 bg-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">About Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-base-content sm:text-4xl">
              Your Trusted Partner in IT Infrastructure
            </p>
            <p className="mt-4 max-w-2xl text-xl text-base-content/70 lg:mx-auto">
              Established in 2026, we are a premier startup dedicated to providing expert engineering solutions for all your hardware and networking needs across India.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              
              <div className="bg-base-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-base-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-content mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-base-content">Installation & Configuration</h3>
                <p className="mt-2 text-base text-base-content/70">
                  We specialize in the professional installation and configuration of switches, routers, laptops, and printers. Our team ensures your hardware is set up for optimal performance.
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-base-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-content mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-base-content">Server Room Support</h3>
                <p className="mt-2 text-base text-base-content/70">
                  Our experts assist in setting up and maintaining server rooms. From structured cabling to rack management, we ensure your data center operations run smoothly.
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-base-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-content mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-base-content">Qualified Field Engineers</h3>
                <p className="mt-2 text-base text-base-content/70">
                  Our workforce consists of highly qualified and experienced field engineers who are ready to tackle technical challenges on-site with professionalism and expertise.
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-base-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-content mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-base-content">Pan-India Service</h3>
                <p className="mt-2 text-base text-base-content/70">
                  We are proud to offer our services all over India. No matter where your branch or office is located, we have the reach to support your IT infrastructure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default About
