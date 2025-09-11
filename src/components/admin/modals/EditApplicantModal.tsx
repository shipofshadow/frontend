import type {Applicant} from "../../../interfaces/applicant.ts";
import React from "react";

interface Props {
    applicant: Applicant | null;
}
const EditApplicantModal: React.FC<Props> = ({ applicant }) => {
    if (!applicant) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    return (
        <>
            <p>Edit Applicant</p>
        </>
    )
}

export default EditApplicantModal;