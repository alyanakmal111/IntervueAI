import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuListCollapse, LuSparkles } from "react-icons/lu";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import RoleInfoHeader from "./components/RoleInfoHeader";
import QuestionCard from "../../components/Cards/QuestionCard";
import AIResponsePreview from "./components/AIResponsePreview";
import Drawer from "../../components/Drawer";
import SkeletonLoading from "../../components/Loader/SkeletonLoading";
import ErrorMessage from "../../components/ErrorMessage";
import RoleInfoHeaderSkeleton from "../../components/Loader/RoleInfoHeaderSkeleton";
import QuestionCardSkeleton from "../../components/Loader/QuestionCardSkeleton";
import PDFExportModal from "./components/PDFExportModal";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const fetchSessionDataByID = async (showLoader = true) => {
    try {
      setErrorMsg("");

      if (showLoader) setIsLoadingSession(true);

      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data && response.data.session && response.data.success) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
      setErrorMsg(
        error?.response?.data?.message ||
          "An error occurred while fetching session data."
      );
      toast.error(errorMsg);
    } finally {
      if (showLoader) setIsLoadingSession(false);
    }
  };

  const refetchSessionData = () => fetchSessionDataByID(false);
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);

      setIsLoading(true);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );

      if (response.data && response.data.success) {
        setExplanation(response.data.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg(
        error?.response?.data?.message ||
          "Failed to generate explanation. Please try again."
      );
      console.error("Error generating explanation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log("Pin response", response);

      if (response.data && response.data.success) {
        await refetchSessionData();
      }
    } catch (error) {
      console.error("Error toggling pin status:", error);
      setErrorMsg(
        error?.response?.data?.message ||
          "An error occurred while updating pin status."
      );
      toast.error(errorMsg);
    }
  };

  const updateQuestionNote = async (questionId, note) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.UPDATE_NOTE(questionId),
        {
          note,
        }
      );

      if (response.data && response.data.success) {
        toast.success(
          note
            ? response?.data?.message || "Note saved successfully!"
            : "Note deleted successfully!"
        );
        await refetchSessionData();
      }
    } catch (error) {
      console.error("Error updating question note:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update question note."
      );
    }
  };

  const addMoreQuestions = async () => {
    try {
      setErrorMsg("");
      setIsUpdateLoader(true);

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role || "",
          topicsToFocus: sessionData?.topicsToFocus || "",
          experience: sessionData?.experience || "",
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse?.data?.data || [];

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data && response.data.success) {
        toast.success("Questions added successfully.");
        await refetchSessionData();
      }
    } catch (error) {
      if (error.response && error?.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("An error occurred while adding questions.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDataByID(true);
    }

    return () => {};
  }, []);

  console.log("sessionData questions", sessionData?.questions);

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50">
        {errorMsg && <ErrorMessage error={errorMsg} />}

        {isLoadingSession ? (
          <RoleInfoHeaderSkeleton />
        ) : (
          <RoleInfoHeader
            role={sessionData?.role}
            topicsToFocus={sessionData?.topicsToFocus}
            experience={sessionData?.experience}
            questions={sessionData?.questions.length}
            description={sessionData?.description}
            lastUpdated={
              sessionData?.updatedAt
                ? moment(sessionData?.updatedAt).format("Do MMM YYYY")
                : ""
            }
          />
        )}
        <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
          <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
            <div
              className={`col-span-12 ${
                openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Interview Q & A
                  </h2>
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    <LuSparkles className="w-4 h-4" />
                    AI Generated
                  </div>
                </div>
                <button
                  onClick={() => setShowPDFModal(true)}
                  className="cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center shadow-lg"
                >
                  Export as PDF
                </button>
              </div>

              <AnimatePresence>
                {isLoadingSession
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <QuestionCardSkeleton key={index} />
                    ))
                  : sessionData?.questions?.map((data, index) => {
                      return (
                        <motion.div
                          key={data._id || index}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.4,
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                            delay: index * 0.1,
                          }}
                          layout
                          layoutId={`question-${data._id || index}`}
                        >
                          <>
                            <QuestionCard
                              question={data.question}
                              answer={data.answer}
                              note={data.note}
                              onLearnMore={() =>
                                generateConceptExplanation(data.question)
                              }
                              isPinned={data.isPinned}
                              onTogglePin={() =>
                                toggleQuestionPinStatus(data._id)
                              }
                              onUpdateNote={(note) =>
                                updateQuestionNote(data._id, note)
                              }
                            />

                            {!isLoading &&
                              sessionData?.questions.length == index + 1 && (
                                <div className="flex items-center justify-center mt-8">
                                  <button
                                    className="flex cursor-pointer items-center gap-3 text-sm text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading || isUpdateLoader}
                                    onClick={addMoreQuestions}
                                  >
                                    {isUpdateLoader ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Loading...
                                      </div>
                                    ) : (
                                      <>
                                        <LuListCollapse className="text-lg" />
                                        Load More Questions
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                          </>
                        </motion.div>
                      );
                    })}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <Drawer
              isOpen={openLearnMoreDrawer}
              onClose={() => setOpenLearnMoreDrawer(false)}
              title={!isLoading && explanation?.title}
            >
              {errorMsg && <ErrorMessage error={errorMsg} />}

              {isLoading && <SkeletonLoading />}

              {!isLoading && explanation && (
                <AIResponsePreview content={explanation?.explanation} />
              )}
            </Drawer>
          </div>

          <PDFExportModal
            isOpen={showPDFModal}
            onClose={() => setShowPDFModal(false)}
            questions={sessionData?.questions}
            sessionData={sessionData}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
