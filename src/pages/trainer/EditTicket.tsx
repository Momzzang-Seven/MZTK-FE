import TicketForm from "@components/trainer/TicketForm";
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
        <TicketForm 
            mode="edit" 
            {...ticketFormProps} 
            onSubmit={ticketFormProps.handleSubmit}
            isSubmitting={ticketFormProps.isSubmitting}
        />
    );
};

export default EditTicket;
