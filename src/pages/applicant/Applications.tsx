import {useAuth} from "../../context/AuthContext.tsx";
import ScholarshipSummary from "../../components/common/admin/ScholarshipSummary.tsx";

const Applications = () => {
    const { user } = useAuth();
    return(
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
            </div>

            <ScholarshipSummary studentId={user?.id} />
        </div>

    )
}

export default Applications;