import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "@store/userStore";
import { AdminLayout, Layout } from "@components/layout"; // AdminLayout 추가
import GlobalSnackbar from "@components/common/GlobalSnackbar";
import {
  Callback,
  Err404,
  Home,
  Login,
  My,
  MyActivity,
  MyTx,
  Verify,
  Community,
  FreeBoard,
  QuestionBoard,
  SelectImage,
  WritePost,
  FreePostDetail,
  QuestionDetail,
  LocalPosts,
  Leaderboard,
  CreateWallet,
  RegisterWallet,
  AdminLogin,
  AdminDashboard,
  TokenLog,
  UserManagement,
  PostManagement,
  AdminAccountManagement,
  Web3Management,
  SystemSettings,
  TrainerDashboard,
  CreateTicket,
  EditTicket,
  TrainerList,
  TrainerReservations,
  TrainerReviews,
  TrainerStoreRegister,
  Market,
  MarketDetail,
  MarketPurchase,
  MarketPurchaseFail,
  MarketReservation,
  ReviewWrite,
  RegisterTicket,
  MyTknHistory,
  VerifyWallet,
} from "@pages";
import ExerciseAuth from "./pages/ExerciseAuth";
import RecordAuth from "./pages/RecordAuth";
import LocationRegister from "./pages/LocationRegister";
import Onboarding from "./pages/Onboarding";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const { user, checkAnalysisCompletion } = useUserStore();

  useEffect(() => {
    // Skip analysis completion check for ADMIN users or unauthenticated users
    if (!user || user.role === "ADMIN") return;

    const interval = window.setInterval(() => {
      void checkAnalysisCompletion();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [checkAnalysisCompletion, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="posts" element={<PostManagement />} />
                <Route path="token-logs" element={<TokenLog />} />
                <Route path="accounts" element={<AdminAccountManagement />} />
                <Route path="web3" element={<Web3Management />} />
                <Route path="settings" element={<SystemSettings />} />

                <Route path="/404" element={<Err404 />} />
                <Route
                  path="*"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
              </Routes>
            </AdminLayout>
          }
        />

        {/* user  */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="flex flex-1 w-full mx-auto h-full bg-white flex flex-col relative overflow-hidden max-w-[450px]">
                <GlobalSnackbar />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/callback" element={<Callback />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/create-wallet" element={<CreateWallet />} />
                  <Route path="/register-wallet" element={<RegisterWallet />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/community" element={<Community />}>
                      <Route index element={<Navigate to="free" replace />} />
                      <Route path="free" element={<FreeBoard />} />
                      <Route path="question" element={<QuestionBoard />} />
                    </Route>
                    <Route
                      path="/community/:type/new/select-image"
                      element={<SelectImage />}
                    />
                    <Route
                      path="/community/:type/new"
                      element={<WritePost />}
                    />
                    <Route
                      path="/community/:type/new/:postId"
                      element={<WritePost />}
                    />
                    <Route
                      path="/community/:type/edit/:postId/select-image"
                      element={<SelectImage />}
                    />
                    <Route
                      path="/community/:type/edit/:postId/:parentId?"
                      element={<WritePost />}
                    />
                    <Route
                      path="/community/free/:postId"
                      element={<FreePostDetail />}
                    />
                    <Route
                      path="/community/question/:postId"
                      element={<QuestionDetail />}
                    />
                    <Route path="/my" element={<My />} />
                    <Route path="/my/activity/:tab" element={<MyActivity />} />
                    <Route path="/myTknTx" element={<MyTx />} />
                    <Route path="/my-tkn-history" element={<MyTknHistory />} />
                    <Route path="/exercise-auth" element={<ExerciseAuth />} />
                    <Route path="/record-auth" element={<RecordAuth />} />
                    <Route
                      path="/location-register"
                      element={<LocationRegister />}
                    />
                    <Route path="/trainer" element={<TrainerDashboard />} />
                    <Route path="/trainer/create" element={<CreateTicket />} />
                    <Route
                      path="/trainer/register-ticket"
                      element={<RegisterTicket />}
                    />
                    <Route path="/trainer/edit/:id" element={<EditTicket />} />
                    <Route path="/trainer/list" element={<TrainerList />} />
                    <Route
                      path="/trainer/reservations"
                      element={<TrainerReservations />}
                    />
                    <Route
                      path="/trainer/reviews"
                      element={<TrainerReviews />}
                    />
                    <Route
                      path="/trainer/store-register"
                      element={<TrainerStoreRegister />}
                    />
                    <Route path="/market" element={<Market />} />
                    <Route
                      path="/market/reservations"
                      element={<MarketReservation />}
                    />
                    <Route
                      path="/market/review/:id"
                      element={<ReviewWrite />}
                    />
                    <Route path="/market/:id" element={<MarketDetail />} />
                    <Route
                      path="/market/purchase/:id"
                      element={<MarketPurchase />}
                    />
                    <Route
                      path="/market/purchase-fail"
                      element={<MarketPurchaseFail />}
                    />
                  </Route>

                  <Route path="/404" element={<Err404 />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
