import TicketForm from "@components/trainer/TicketForm";
import { useTicketForm } from "@hooks/trainer/useTicketForm";

/**
 * 트레이너 클래스 수정 페이지
 */
const EditTicket = () => {
    const ticketFormProps = useTicketForm("edit");

    return (
        <TicketForm 
            mode="edit" 
            {...ticketFormProps} 
            onSubmitSuccess={ticketFormProps.handleSubmitSuccess} 
        />
    );
};

export default EditTicket;
