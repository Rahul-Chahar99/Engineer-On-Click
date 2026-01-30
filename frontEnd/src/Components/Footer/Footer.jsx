import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
   <section className='relative overflow-hidden py-10 bg-white border-t border-gray-300'>
    <div className='relative z-10 mx-auto max-w-7xl px-4'>
        <div className='flex flex-wrap justify-between'>
            <div className='w-full p-6 lg:w-3/12'>
               
            </div>
            <div className='w-full p-6 lg:w-3/12'>
                <div className='h-full'>
                    <h3 className='tracking-px mb-9 text-xs font-semibold uppercase text-gray-500'>Company</h3>
                    <ul>
                        <li className='mb-4'>
                            <Link className="text-base font-medium text-gray-900 hover:text-gray-700" to='/'>
                                Features
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Pricing
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Affiliate Program
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Press kit
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='w-full p-6 lg:w-3/12'>
                <div className='h-full'>
                    <h3 className='tracking-px mb-9 text-xs font-semibold uppercase text-gray-500'>Support</h3>
                    <ul>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Account
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Help
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Contact US
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Customer Support
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='w-full p-6 lg:w-3/12'>
                <div className='h-full'>
                    <h3 className='tracking-px mb-9 text-xs font-semibold uppercase text-gray-500'>Legal</h3>
                    <ul>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Terms & Conditions
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Privacy Policy
                            </Link>
                        </li>
                        <li className='mb-4'>
                            <Link className='text-base font-medium text-gray-900 hover:text-gray-700' to='/'>
                                Licensing
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div className='border-t border-gray-300 pt-6 mt-6'>
            <p className='text-sm text-gray-600 text-center'>
                &copy; Copyright 2023. All Rights Reserved by DevUI.
            </p>
        </div>
    </div>
   </section>
  )
}

export default Footer
