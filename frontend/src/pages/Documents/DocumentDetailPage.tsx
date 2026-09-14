import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Tabs from "@/components/common/Tabs";
import NotFound from "@/components/common/NotFound";
import ChatInterface from "@/components/messages/ChatInterface";
import FileViewer from "@/components/documents/viewers/FileViewer";
import AIActions from "@/components/ai/AIActions";
import FlashcardManager from "@/components/flashcards/FlashcardManager";
import QuizManager from "@/components/quizzes/QuizManager";
import DocumentNetworkTab from "@/components/documents/network/DocumentNetworkTab";
import type { Document } from "@/types/models";

const DocumentDetailPage = () => {
  const { documentId } = useParams<{ documentId: string }>();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  // Fetch document details based on the id from params
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await documentService.getDocumentById(documentId as string);
        setDocument(response.data);
      } catch (error) {
        console.error("Error fetching document details:", error);
        toast.error("Không thể lấy chi tiết tài liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Render content file PDF
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!document || !document.filePath) {
      return <div className="">Không thể hiển thị tài liệu.</div>;
    }

    // Use smart FileViewer for PDF, DOCX, etc.
    return (
      <FileViewer
        url={document.fileUrl as string}
        mimeType={document.mimeType}
        fileName={document.fileName}
        className="min-h-[70vh]"
      />
    );
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
    return <FlashcardManager documentId={documentId as string} />;
  };

  // Render quizzes tab
  const renderQuizzes = () => {
    return <QuizManager documentId={documentId as string} />;
  };

  // Render network tab
  const renderNetwork = () => {
    return <DocumentNetworkTab documentId={documentId as string} />;
  };

  // Tabs
  const tabs = [
    { name: "content", label: "Nội dung", content: renderContent() },
    // { name: "network", label: "Network", content: renderNetwork() }, // Tạm tắt tính năng Network theo yêu cầu
    { name: "chat", label: "Chat", content: renderChat() },
    { name: "ai-actions", label: "AI", content: renderAIAction() },
    { name: "flashcards", label: "Flashcards", content: renderFlashcards() },
    { name: "quizzes", label: "Bài kiểm tra", content: renderQuizzes() },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!document) {
    return (
      <NotFound
        title="Không tìm thấy tài liệu"
        message="Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        backUrl="/documents"
        backText="Quay lại danh sách tài liệu"
      />
    );
  }

  return (
    <div className="">
      <div className="">
        <Link
          to="/documents"
          className="inline-flex mb-4 items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <PageHeader title={document.title as string} />
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default DocumentDetailPage;
