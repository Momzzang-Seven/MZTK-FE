import TicketForm from "@components/trainer/TicketForm";
import { CommonModal } from "@components/common";
import { useTicketForm } from "@hooks/trainer/useTicketForm";

/**
 * 트레이너 클래스 수정 페이지
 */
const EditTicket = () => {
  const ticketFormProps = useTicketForm("edit");

  if (ticketFormProps.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-sm font-medium text-gray-500">
        클래스 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <>
      <TicketForm
        mode="edit"
        {...ticketFormProps}
        onSubmit={ticketFormProps.handleSubmit}
        isSubmitting={ticketFormProps.isSubmitting}
      />
      {ticketFormProps.isSuccessModalOpen && (
        <CommonModal
          title="수정 완료"
          desc="클래스 정보가 성공적으로 수정되었습니다!<br/>목록에서 변경된 내용을 확인해 보세요."
          confirmLabel="목록으로 이동"
          onConfirmClick={() => {
            ticketFormProps.setIsSuccessModalOpen(false);
            ticketFormProps.navigate("/trainer/list", { replace: true });
          }}
        />
      )}
    </>
  );
};

export default EditTicket;
