# Engineer-On-Click

`https://api.postalpincode.in/pincode/${pincode}`

# Project: Engineer-On-Click

A full-stack on-demand field engineer booking platform, similar to "Urban Company for engineers."

# What it does
Customers can book a field engineer for a specific date/time range at their location. The admin assigns an available engineer based on pincode matching. The engineer can accept or reject the booking.

# Tech Stack
Backend: Node.js + Express.js, deployed on Vercel

Database: MongoDB (Mongoose ODM)

Cache: Redis (with MongoDB fallback)

Auth: JWT (access + refresh token rotation), HTTP-only cookies

Payments: Razorpay (order creation + signature verification)

File Uploads: Multer + Cloudinary (avatars)

Frontend: React + Vite + Redux Toolkit, deployed on Vercel

Roles
customer — registers, books engineers, makes payments

engineer — views assigned bookings, accepts/rejects them

admin — manages users, assigns engineers to bookings, views contact forms

# Core Data Models
User — shared model for all 3 roles; has pincode, aadharNo, mobileNo, jobTitle, socialMedia, is_active flag

EngineerForm (booking) — tracks customerId, assignedEngineerId, branchId, date/time range, payment status (Pending/Completed/Failed), engineer assignment status (Pending/Assigned/Accepted/Rejected_By_Engineer/Completed)

BranchData — branch offices with manager details and Google Maps link

Contact — contact form submissions

# Key Flows
Customer fills booking form → Razorpay order created → payment verified → booking saved with paymentStatus: Completed
# Admin views booking → fetches available engineers by pincode match → assigns one → engineerAssign: Assigned

Engineer sees booking on dashboard → accepts or rejects → status updates accordingly

# Pincode lookup uses external API: https://api.postalpincode.in/pincode/{pincode}

# Caching Strategy
Engineers and customers lists are cached in Redis for 1 hour (get_all_engineers, get_all_customers keys). Cache is invalidated on delete. All list endpoints support server-side pagination + search filtering.



#################################
# Feature Ideas using WebSockets
Beyond notifying the admin about new bookings, here are some excellent features you can build into your platform using WebSockets:

Engineer Assignment Alerts: When an admin assigns an engineer to a booking (in assignEngineer), instantly notify the engineer on their dashboard so they don't have to refresh the page to see their new job.
Customer Status Updates: When an engineer accepts or rejects a booking, or when a payment is verified, instantly notify the customer that their booking status has changed to "Assigned" or "Completed".
Live Dashboard Analytics: On the admin page, dynamically update the count of "Total Bookings", "Active Engineers", or "Pending Requests" the moment a change happens in the database.
Real-time Chat/Support System: Allow customers to chat directly with their assigned engineer or with admin support regarding their booking details or location.
Online/Offline Status: Show admins which engineers are currently online and browsing the portal, which can help them decide who to assign urgent tasks to.