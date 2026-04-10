import TicketForm from "@components/trainer/TicketForm";
import { useTicketForm } from "@hooks/trainer/useTicketForm";

/**
 * 트레이너 클래스 등록 페이지
 */
const CreateTicket = () => {
    const ticketFormProps = useTicketForm("create");

    return (
        <TicketForm 
            mode="create" 
            {...ticketFormProps} 
            onSubmitSuccess={ticketFormProps.handleSubmitSuccess} 
        />
    );
};

export default CreateTicket;
