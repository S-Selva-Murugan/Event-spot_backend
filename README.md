<h2>Event Spot – Online Event Finding App </h2>
<h2>https://event-spot-frontend.vercel.app/</h2>

<h3>Event Spot is an online event-finding app that helps users discover events happening near them using their location coordinates and a specified radius. It offers features for booking tickets, viewing event details, and managing user accounts.</h3>

Frontend Technologies
<ul>
<li>Geo-Spatial Search : Finds events within user's radius using their location & radius (converted to radians)
                    EventModel.find({
                              location: {
                                  $geoWithin: {
                                      $centerSphere: [[userlon, userlat], radiusInRadians]}}}) </li>

<li>Maps: react-leaflet - Integrates interactive maps for visualizing event locations.</li>

<li>Multi-Step Form for the creating the event by the organiser</li>

<li>  Icons: @fortawesome/free-solid-svg-icons - Provides vector icons for various purposes.</li>

<li>Calendar and Events: @fullcalendar/react - Facilitates displaying bookings and events in a calendar format.</li>

<li>Dashboards: Apexcharts, react-chartjs-2 - Create visually appealing and interactive dashboards for displaying data like event statistics.</li>

<li>Data Fetching: axios - Enables communication with the backend API to retrieve and send data.</li>

<li>UI Framework and Components: bootstrap, react-bootstrap, @mui/material - Provide building blocks for creating responsive and visually appealing user interfaces.</li>

<li>Form Management: formik, yup - Offer tools for building efficient and user-friendly forms with validation.</li>

<li>Authentication and Authorization: jwt-decode - Decodes JWT tokens for user data to enable role-based access control.</li>

<li>Date Formatting: moment - Allows converting and formatting date objects for user-friendliness.</li>

<li>Reviews and Ratings: react-awesome-stars-rating, react-rating-stars-component - Facilitate user reviews and ratings for events.</li>

<li>Timing: react-countdown - Displays a countdown timer for events with limited time availability.</li>

<li>Image Uploads: react-filepond - Enables users to upload images for event profiles.</li>


<li>Carousel: react-multi-carousel - Presents a carousel component for showcasing events based on categories.</li>

<li>QR Codes: react-qr-code - Generates QR codes for secure access or displaying ticket details.</li>

<li>State Management: react-redux, Context API, useReducer - Manage complex application state effectively.</li>

<li>Routing: react-router-dom - Enables navigation between different sections of the app.</li>

<li>Dropdowns and Selects: react-select - Provides dropdown menus and selection options for categories, addresses, etc.</li>

<li>Notifications: react-toastify, sweetalert2 and Snackbar- Display user notifications like success messages, warnings, or errors.</li>

<li>Geo Code: This API is utilized for searching addresses and retrieving their corresponding latitude and longitude coordinates. It enhances location-based features by accurately identifying and geocoding user-provided addresses, thereby improving the precision of location-based services within the application.</li>

<li>React-Select: Implemented for creating dropdown menus that enable users to select addresses and categories. This component enhances user interaction by providing a user-friendly interface for choosing options from predefined lists. It simplifies the process of selecting addresses and categories, contributing to an improved overall user experience within the application.</li>

</ul>


Backend Technologies

<ul>
  
<li>Server Framework: express - Provides the foundation for building the backend API that handles user requests and interacts with the database.</li>

<li>Authentication and Authorization: bcryptjs, jsonwebtoken - Implement secure authentication using password hashing and JWT tokens for user authorization.</li>

<li>Security: express-validator, joi, morgan - Validate user input, prevent vulnerabilities, and log HTTP requests and responses for monitoring.</li>

<li>File Storage: @aws-sdk/client-s3, multer, multer-s3 - Integrate with Amazon S3 cloud storage for uploading and managing event images.</li>

<li>Email Management: nodemailer - Sends emails for functionalities like password reset or notifications after booking the events.</li>

<li>Location and Distance: geolib - Calculates distances between user location and event locations for radius search.</li>

<li>Payments: stripe - Integrates Stripe for secure payment processing of event tickets.</li>

<li>Scheduling Tasks: node-cron - Enables scheduling automated tasks like sending reminder emails or updating event status and Deleting the Booking if payment not paid.</li>
</ul>

Overall, Event Spot leverages a comprehensive set of technologies to deliver a user-friendly and feature-rich online event-finding experience.

BACKEND API


