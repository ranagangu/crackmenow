import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import { AnnouncementProvider } from "./context/AnnouncementContext";
import ScrollToTop from "./ScrollToTop";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationPage = lazy(() => import("./pages/NotificationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const OSCPStyleExercise = lazy(() => import("./pages/OSCPStyleExercise"));
const OscpCertificate = lazy(() => import("./pages/OSCP_Certificate"));
const Profile = lazy(() => import("./pages/Profile"));
const EpicGallery = lazy(() => import("./pages/EpicGallery"));
const OurFAQ = lazy(() => import("./pages/OurFAQ"));
const Testimonial = lazy(() => import("./pages/Testimonial"));
const UpcomingChallenges = lazy(() => import("./pages/UpcomingChallenges"));
const HistoricalChallenges = lazy(() => import("./pages/HistoricalChallenges"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const TrainingPath = lazy(() => import("./pages/TrainingPath"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Levels = lazy(() => import("./pages/Levels"));
const LabPage = lazy(() => import("./pages/LabPage"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Labs = lazy(() => import("./pages/Labs"));
const MyFAQ = lazy(() => import("./pages/MyFAQ"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./admin/users/ManageUsers"));
const ManageLabs = lazy(() => import("./admin/labs/ManageLabs"));
const CreateLab = lazy(() => import("./admin/labs/CreateLab"));
const EditLab = lazy(() => import("./admin/labs/EditLab"));
const AdminSubmissions = lazy(() => import("./admin/submissions/AdminSubmissions"));
const HistoricalChallengesAdmin = lazy(() => import("./admin/challenges/HistoricalChallenges"));
const AnalyticsDashboard = lazy(() => import("./admin/analytics/AnalyticsDashboard"));
const Announcements = lazy(() => import("./admin/communication/Announcements"));
const SystemSettings = lazy(() => import("./admin/settings/SystemSettings"));
const AdminContactQueries = lazy(() => import("./admin/admincontactqueries/AdminContactQueries"));
const AdminFAQManager = lazy(() => import("./admin/AdminFAQManager/AdminFAQManager"));
const AdminChallengeManager = lazy(() => import("./admin/adminChallengeManager/AdminChallengeManager"));
const AdminBlogs = lazy(() => import("./admin/blogs/AdminBlogs"));

const RouteFallback = () => (
  <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", color: "#94a3b8" }}>
    Loading...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="bottom-right" />
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />

          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/labs/:id" element={<LabPage />} />
              <Route path="/oscp-style-exercise" element={<OSCPStyleExercise />} />
              <Route path="/OSCP_Certificate" element={<OscpCertificate />} />
              <Route path="/upcoming-challenges" element={<UpcomingChallenges />} />
              <Route path="/historical-challenges" element={<HistoricalChallenges />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/training-path" element={<TrainingPath />} />
              <Route path="/gallery" element={<EpicGallery />} />
              <Route path="/faq" element={<OurFAQ />} />
              <Route path="/testimonial" element={<Testimonial />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/levels" element={<Levels />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/my-faq" element={<MyFAQ />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<BlogDetails />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="submissions" element={<AdminSubmissions />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="labs" element={<ManageLabs />} />
                <Route path="labs/create" element={<CreateLab />} />
                <Route path="labs/edit/:id" element={<EditLab />} />
                <Route path="challenges" element={<AdminChallengeManager />} />
                <Route path="challenges/history" element={<HistoricalChallengesAdmin />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="communication" element={<Announcements />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="contact-queries" element={<AdminContactQueries />} />
                <Route path="manage-faqs" element={<AdminFAQManager />} />
                <Route path="blogs" element={<AdminBlogs />} />
              </Route>

              <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin-login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AnnouncementProvider>
    </AuthProvider>
  );
}

export default App;
