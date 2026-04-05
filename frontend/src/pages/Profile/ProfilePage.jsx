import { useState, useEffect, useRef } from "react";
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
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const PasswordField = ({ label, icon: Icon, value, onChange, placeholder, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Icon size={18} />
        </div>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-11 pl-11 pr-12 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setProfileImage(user.profileImage || "");
      setPreviewImage(user.profileImage || "");
    }
  }, [user]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 3MB");
      return;
    }

    const base64 = await fileToBase64(file);
    setPreviewImage(base64);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const hasImageChanged = previewImage !== profileImage;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Tên hiển thị không được để trống");
      return;
    }

    setLoading(true);
    try {
      const payload = { username: username.trim() };
      if (hasImageChanged) {
        payload.profileImage = previewImage;
      }

      const res = await authService.updateProfile(payload);
      const updated = res.data;

      setProfileImage(updated.profileImage || "");
      setPreviewImage(updated.profileImage || "");
      updateUser({
        username: updated.username,
        profileImage: updated.profileImage,
      });

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      const msg = error?.error || error?.message || "Cập nhật thất bại, thử lại sau";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const msg = error?.error || error?.message || "Đổi mật khẩu thất bại, thử lại sau";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const GeneralTab = (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`relative group cursor-pointer select-none transition-all duration-200 ${isDragging ? "scale-105" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            title="Nhấp hoặc kéo thả ảnh vào đây"
          >
            <div
              className={`w-28 h-28 rounded-full overflow-hidden border-4 transition-all duration-200 shadow-lg ${isDragging
                ? "border-emerald-400 ring-4 ring-emerald-100"
                : "border-slate-100 group-hover:border-emerald-200"
                }`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                  <User size={44} strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="text-white w-7 h-7" />
              <span className="text-white text-[10px] font-semibold tracking-wide">
                {previewImage ? "Đổi ảnh" : "Tải lên"}
              </span>
            </div>

            {isDragging && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                Thả ảnh vào đây
              </div>
            )}
          </div>

          {hasImageChanged && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Upload size={12} />
              Ảnh đã thay đổi — nhấn &quot;Lưu thay đổi&quot; để cập nhật
            </p>
          )}

          <p className="text-xs text-slate-400 text-center">
            Hỗ trợ JPG, PNG, WebP, GIF · Tối đa 3MB
            <br />
            Kéo thả hoặc nhấp để chọn ảnh
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        <div className="border-t border-slate-100" />

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="profile-username" className="block text-sm font-semibold text-slate-700">
              Tên hiển thị
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="Nhập tên hiển thị"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400">Email không thể thay đổi vì lý do bảo mật</p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Đang lưu...</>
              ) : (
                <>
                  <Save size={16} />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const SecurityTab = (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">
            Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại trên các thiết bị khác.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6">
          <PasswordField
            id="current-password"
            label="Mật khẩu hiện tại"
            icon={KeyRound}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
          />

          <PasswordField
            id="new-password"
            label="Mật khẩu mới"
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
          />

          {newPassword && (
            <div className="space-y-1 -mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${newPassword.length >= level * 3
                      ? level <= 1
                        ? "bg-red-400"
                        : level <= 2
                          ? "bg-orange-400"
                          : level <= 3
                            ? "bg-yellow-400"
                            : "bg-emerald-500"
                      : "bg-slate-200"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                {newPassword.length < 3
                  ? "Quá yếu"
                  : newPassword.length < 6
                    ? "Yếu"
                    : newPassword.length < 9
                      ? "Trung bình"
                      : "Mạnh"}
              </p>
            </div>
          )}

          <PasswordField
            id="confirm-password"
            label="Xác nhận mật khẩu mới"
            icon={FileLock2}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
          />

          {confirmPassword && (
            <p
              className={`text-xs font-medium flex items-center gap-1 -mt-2 ${confirmPassword === newPassword ? "text-emerald-600" : "text-red-500"
                }`}
            >
              <CheckCircle2 size={12} />
              {confirmPassword === newPassword ? "Mật khẩu khớp" : "Mật khẩu chưa khớp"}
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Đang cập nhật...</>
              ) : (
                <>
                  <KeyRound size={16} />
                  Đổi mật khẩu
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const tabs = [
    { name: "general", label: "Thông tin chung", content: GeneralTab },
    { name: "security", label: "Bảo mật", content: SecurityTab },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <PageHeader
          title="Hồ sơ cá nhân"
          subTitle="Quản lý thông tin và bảo mật tài khoản của bạn"
        />
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default ProfilePage;
