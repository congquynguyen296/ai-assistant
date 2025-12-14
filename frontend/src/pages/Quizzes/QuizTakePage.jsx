import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import quizService from "../../services/quizService";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submiting, setSubmitting] = useState(false);

  // Get quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response?.data);
      } catch (error) {
        console.error(`Có lỗi xảy ra khi lấy danh sách câu hỏi: ${error}`);
        toast.error("Có lỗi xảy ra khi lấy danh sách câu hỏi");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  return <div>QuizTakePage</div>;
};

export default QuizTakePage;
