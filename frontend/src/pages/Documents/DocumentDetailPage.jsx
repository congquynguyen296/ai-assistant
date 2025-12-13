import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import documentService from "../../services/documentService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ArrowLeft, DoorOpen } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";
import PDFViewer from "../../components/documents/PDFViewer";
import AIActions from "../../components/ai/AIActions";

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

  // Helper func to get URL PDF file
  const getFileUrl = (localPath) => {
    if (!localPath) return "";

    if (localPath.startsWith("http")) return localPath;
    const serverBaseUrl = "http://localhost:8000";

    const normalizedPath = localPath.replace(/\\/g, "/");
    const relativePath = normalizedPath.split("/uploads/")[1];

    if (relativePath) {
      return `${serverBaseUrl}/uploads/${relativePath}`;
    }

    return localPath;
  };

  // Render content file PDF
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!document || !document.filePath) {
      return <div className="">Không thể hiển thị tài liệu.</div>;
    }

    const pdfUrl = getFileUrl(document.filePath);
    return <PDFViewer pdfUrl={pdfUrl} />;
  };

  // Render chat AI
  const renderChat = () => {
    if (activeTab !== "chat") return null;
    return <ChatInterface />;
  };

  // Render AI action
  const renderAIAction = () => {
    return <AIActions />;
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
