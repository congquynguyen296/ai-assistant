import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import documentService from "../../services/documentService";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import { FileText, Plus, Trash2, UploadCloud, X } from "lucide-react";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  // State for documents
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Fetch documents function
  const fectchDocuments = async () => {
    try {
      const response = await documentService.getDocuments();
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Lấy danh sách tài liệu thất bại:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    fectchDocuments();
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension for default title
    }
  };

  // Handle upload function
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle) {
      toast.warning("Vui lòng chọn file và nhập tiêu đề");
      return;
    }

    setUploading(true);

    // Build form data
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Tải lên tài liệu thành công");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      fectchDocuments();
    } catch (error) {
      console.error("Tải lên tài liệu thất bại:", error);
      toast.error("Tải lên tài liệu không thành công");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete request function
  const handleDeleteRequest = (document) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete function
  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;
    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDocument._id);
      toast.success("Xóa tài liệu thành công");
      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
      setDocuments(documents.filter((doc) => doc._id !== selectedDocument._id));
    } catch (error) {
      console.error("Xóa tài liệu thất bại:", error);
      toast.error("Xóa tài liệu không thành công");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      );
    }

    if (documents && documents.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200  shadow-lg shadow-slate-200/50 mb-6">
              <FileText
                className="w-10 h-10 text-slate-400"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">
              Chưa có tài liệu
            </h3>
            <p className="text-sm mb-6 text-slate-500">
              Bắt đầu tải lên tài liệu ngay bây giờ
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Tải lên
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {documents?.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Sub backgroud */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Quản lý tài liệu
            </h1>
            <p className="text-slate-500 mb-2">
              Nơi lưu trữ tổng hợp các tài liệu đã tải lên hệ thống
            </p>
            <p className="text-slate-500 mb-2">
              {documents && `${documents.length} tài liệu`}
            </p>
          </div>
          {documents && documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Tải lên
            </Button>
          )}
        </div>

        {renderContent()}
      </div>

      {/* Upload modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 p-4">
            {/* Close button */}
            <button
              className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
              onClick={() => setIsUploadModalOpen(false)}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal header */}
            <div className="mb-6">
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                Tải lên tài liệu mới
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Chọn file từ máy tính của bạn để tải lên hệ thống
              </p>
            </div>

            {/* Form modal */}
            <form onSubmit={handleUpload} className="space-y-5">
              {/* Title input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  required
                  className="w-full h-12 px-4 border border-slate-300 rounded-xl bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-emerald-500/10 transition-all duration-200"
                  placeholder="e.g., Hóa Phân Tích"
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              {/* File input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  PDF File
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-emerald-400 hover:bg-slate-50/30 cursor-pointer transition-all duration-200">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                  <div className="flex flex-col items-center justify-center py-10 px-6">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                      <UploadCloud
                        className="w-7 h-7 text-emerald-600"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1 text-center">
                      {uploadFile ? (
                        <span className="text-emerald-600">
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-emerald-600">Click để tải</span>{" "}
                          hoặc kéo và thả file vào đây
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Hỗ trợ tối đa 10MB</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disable={uploading}
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disable={uploading}
                  className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hove
r:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {" "}
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tải lên...
                    </span>
                  ) : (
                    "Tải lên"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 p-4">
            {/* Close button */}
            <button
              className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                Xác nhận xóa
              </h2>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-500 mb-6">
              Bạn có chắc muốn xóa tài liệu{" "}
              <span className="font-semibold text-slate-900">
                {selectedDocument?.title || "này"}?
              </span>{" "}
              Hành động này không thể hoàn tác sau khi được xác nhận.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disable={deleting}
                className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 h-10 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xóa...
                    </span>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
