import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import Tabs from "@/components/common/Tabs";
import Button from "@/components/common/Button";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  KeyRound,
  FileLock2,
} from "lucide-react";

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // General Info State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        username,
        profileImage, // Currently just sending the string URL if it exists
      });

      // Update context
      // We need to merge with existing token since updateProfile might not return token
      const token = localStorage.getItem("token");
      login(updatedUser.data, token);

      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const GeneralTab = (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                  <User size={40} strokeWidth={2} />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="text-white w-8 h-8" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Ảnh đại diện được đồng bộ từ Google hoặc Gravatar
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Tên hiển thị
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="Nhập tên hiển thị"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500">
              Email không thể thay đổi vì lý do bảo mật
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disable={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
              <Save size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const SecurityTab = (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <FileLock2 size={18} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disable={loading}>
              {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
              <Save size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const tabs = [
    {
      name: "general",
      label: "Thông tin chung",
      content: GeneralTab,
    },
    {
      name: "security",
      label: "Bảo mật",
      content: SecurityTab,
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <PageHeader
          title="Hồ sơ cá nhân"
          subTitle="Quản lý thông tin và bảo mật tài khoản của bạn"
        />

        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default ProfilePage;
