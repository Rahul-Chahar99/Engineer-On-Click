import React, { useState, useEffect } from 'react'
import Container from './Container/Container'
import axios from 'axios'
import toast from 'react-hot-toast'
import Button from '../ReusableComponents/Button.jsx'

function ContactForms() {
  const [contactForms, setContactForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const deleteContactForm = async (formId) => {
    try {
      const response = await axios.delete(`/api/v1/admin-dashboard/contact-forms/${formId}`);
      if (response.status === 200) {
        setContactForms(prevForms => prevForms.filter(form => form._id !== formId));
        toast.success("Contact form deleted successfully");
      } else {
        toast.error("Failed to delete contact form");
      }
    } catch (error) {
      toast.error("Error deleting contact form");
    }
  }

  useEffect(() => {
    const getContactForms = async () => {
      try {
        const response = await axios.get('/api/v1/admin-dashboard/contact-forms');
        if (response.status === 200) {
          const forms = response.data.data || response.data;
          forms.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setContactForms(forms);
        } else {
          toast.error("Failed to fetch contact forms");
        }
      } catch (error) {
        console.error('Error fetching contact forms:', error);
        
      } finally {
        setLoading(false);
      }
    };

    getContactForms();
  }, []);

  // if (loading) {
  //   return (
  //     <Container>
  //       <div className="flex justify-center items-center py-12">
  //         <p className="text-lg">Loading contact forms...</p>
  //       </div>
  //     </Container>
  //   );
  // }

  return (  
    <Container>
      <div className="w-full py-8">
        <h1 className="text-3xl font-bold text-base-content mb-6">Contact Forms</h1>
        <Button
          bgColor="bg-neutral text-neutral-content"
          className="rounded-lg" // This className will be passed to the underlying button
          onClick={() => window.history.back()} // Corrected: use 'onClick' (camelCase)
        >
          Go Back
        </Button>
        {contactForms && contactForms.length > 0 ? (
          <div className="space-y-4">
            {contactForms.map((form, index) => (
              <div key={form._id || index} className="bg-base-100 text-base-content rounded-lg shadow-lg p-6 border border-base-300">
                <h2 className="text-xl font-bold text-base-content">{form.fullName}</h2>
                <p className=""><strong>Email:</strong> {form.email}</p>
                <p className=""><strong>Message:</strong> {form.message}</p>
                <p className=""><strong>Phone Number:</strong> {form.phoneNumber}</p>
                <p className="text-sm text-base-content/70 mt-2">
                  <strong>Submitted:</strong> {form.createdAt ? new Date(form.createdAt).toLocaleString() : "Date not available"}
                </p>
                <Button
                children="Delete Form"
                bgColor="bg-error hover:bg-error/80 text-error-content"
                className="mt-3 rounded-lg cursor-pointer px-4 py-2 text-white font-semibold"
                onClick={() => deleteContactForm(form._id)}
                />
              </div>
            ))}
          </div>
        ) : (
         <div className="flex justify-center items-center h-64">
            <p className="text-base-content/50 text-lg">No Contact Forms Available</p>
          </div>
        )}
      </div>
    </Container>
  )
}

export default ContactForms
