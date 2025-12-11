import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { BASE_URL } from "../../utils/apiPath";
import documentService from "../../services/documentService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ArrowLeft, DoorOpen } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";

const DocumentDetailPage = () => {
  const { documentId: id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  // Fetch document details based on the id from params
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await documentService.getDocumentById(id);
        setDocument(response.data);
      } catch (error) {
        console.error("Error fetching document details:", error);
        toast.error("Không thể lấy chi tiết tài liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Render content file PDF
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!document || !document.filePath) {
      return <div className="">Không thể hiển thị tài liệu.</div>;
    }

    // Helper func to get URL PDF file
    const getFileUrl = (localPath) => {
      if (!localPath) return "";

      // Nếu path đã là http... thì giữ nguyên
      if (localPath.startsWith("http")) return localPath;

      // Xử lý đường dẫn Windows: D:\...\backend\src\uploads\documents\file.pdf
      // Chúng ta cần lấy phần sau chữ "uploads"
      // Kết quả mong muốn: http://localhost:5000/uploads/documents/file.pdf

      const serverBaseUrl = "http://localhost:8000";

      // Chuẩn hóa dấu gạch chéo ngược "\" thành "/"
      const normalizedPath = localPath.replace(/\\/g, "/");

      // Cắt chuỗi để lấy phần đuôi bắt đầu từ /uploads
      // Logic này phụ thuộc vào cách bạn lưu path trong DB.
      // Cách an toàn nhất là tìm vị trí của thư mục được public (ví dụ 'uploads')
      const relativePath = normalizedPath.split("/uploads/")[1];

      if (relativePath) {
        return `${serverBaseUrl}/uploads/${relativePath}`;
      }

      return localPath;
    };

    const pdfUrl = getFileUrl(document.filePath);

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm text-gray-700 font-medium">
            Tài liệu chi tiết
          </span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <DoorOpen size={16} />
            Mở trong cửa sổ mới
          </a>
        </div>

        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
            title="PDF Viewer"
            style={{ colorScheme: "light" }}
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    );
  };

  // Render chat AI
  const renderChat = () => {
    if (activeTab !== "chat") return null;
    return <ChatInterface />;
  };

  // Render AI action
  const renderAIAction = () => {
    return <div className="">Tạo hành động AI với tài liệu</div>;
  };

  // Render flashcards tab
  const renderFlashcards = () => {
    return <div className="">Flashcards từ tài liệu</div>;
  };

  // Render quizzes tab
  const renderQuizzes = () => {
    return <div className="">Bài kiểm tra từ tài liệu</div>;
  };

  // Tabs
  const tabs = [
    { name: "content", label: "Nội dung", content: renderContent() },
    { name: "chat", label: "Chat", content: renderChat() },
    { name: "ai-actions", label: "AI", content: renderAIAction() },
    { name: "flashcards", label: "Flashcards", content: renderFlashcards() },
    { name: "quizzes", label: "Bài kiểm tra", content: renderQuizzes() },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Không tìm thấy tài liệu.</div>;
  }

  return (
    <div className="">
      <div className="">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <PageHeader title={document.title} />
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default DocumentDetailPage;
