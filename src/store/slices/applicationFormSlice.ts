// src/store/applicationFormSlice.ts
import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ApplicationForm} from "../../interfaces/ApplicationForm.ts";

type GradeRow = { subject: string; grade: string; units: string };
type SerializableForm = Omit<ApplicationForm,
    'itr' | 'grades' | 'gradesList'
> & { gradesDraft: GradeRow[] };

type ApplicationFormState = {
    data: SerializableForm;
};

const emptyDraft: SerializableForm = {
    firstName: '', middleName: '', lastName: '', nameExtension: '',
    email: '', phone: '', birthDate: '', civilStatus: '', citizenship: 'Filipino',
    street: '', regionCode: '', regionName: '', provinceCode: '', provinceName: '',
    municipalityCode: '', municipalityName: '', barangayCode: '', barangayName: '',
    father: { lastName: '', firstName: '', middleName: '', extension: '', occupation: '', income: 0 },
    mother: { lastName: '', firstName: '', middleName: '', occupation: '', income: 0 },
    emergencyContactName: '', emergencyContactNumber: '',
    householdNumber: 0, siblings: 0, siblingsStudying: 0, ipAffiliation: '', dswdProgram: '',
    studentId: '', year_level: '', campus: 0, department: 0, course: 0,
    academicYearId: 0, semesterId: 0, enrollmentStatus: '', total_units: 0,
    scholarshipName: '', otherScholarship: '', scholarshipAmount: 0,
    gradesDraft: [{ subject: '', grade: '', units: '' }],
};

const initialState: ApplicationFormState = { data: emptyDraft };

const slice = createSlice({
    name: 'applicationForm',
    initialState,
    reducers: {
        hydrate(state, action: PayloadAction<SerializableForm>) {
            state.data = action.payload || emptyDraft;
        },
        setField(state, action: PayloadAction<{ key: keyof SerializableForm; value: any }>) {
            const { key, value } = action.payload;
            (state.data as any)[key] = value;
        },
        setNested(
            state,
            action: PayloadAction<{ parent: 'father' | 'mother'; key: string; value: any }>
        ) {
            const { parent, key, value } = action.payload;
            (state.data as any)[parent][key] = value;
        },
        setGradesDraft(state, action: PayloadAction<GradeRow[]>) {
            state.data.gradesDraft = action.payload;
            // also recompute total_units here if desired
            state.data.total_units = action.payload.reduce((acc, g) => acc + Number(g.units || 0), 0);
        },
        reset() {
            return { data: emptyDraft };
        },
    },
});

export const { hydrate, setField, setNested, setGradesDraft, reset } = slice.actions;
export default slice.reducer;
