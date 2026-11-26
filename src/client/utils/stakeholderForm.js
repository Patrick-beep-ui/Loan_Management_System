export const EMPTY_STAKEHOLDER_FORM = {
    first_name: "",
    last_name: "",
    national_id: "",
    marital_status: "",
    occupation: "",
    date_of_birth: "",
};

export function stakeholderToForm(stakeholder) {
    return {
        first_name: stakeholder?.first_name ?? "",
        last_name: stakeholder?.last_name ?? "",
        national_id: stakeholder?.national_id ?? "",
        marital_status: stakeholder?.marital_status ?? "",
        occupation: stakeholder?.occupation ?? "",
        date_of_birth: stakeholder?.date_of_birth ?? "",
    };
}

export function buildStakeholderPayload(values) {
    return {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        national_id: values.national_id.trim(),
        marital_status: values.marital_status || null,
        occupation: values.occupation.trim(),
        date_of_birth: values.date_of_birth || null,
    };
}

function isRealDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

export function validateStakeholderForm(values) {
    const errors = {};
    const firstName = values.first_name.trim();
    const lastName = values.last_name.trim();
    const nationalId = values.national_id.trim();
    const occupation = values.occupation.trim();

    if (!firstName) errors.first_name = "First name is required.";
    else if (firstName.length > 100)
        errors.first_name = "First name must be at most 100 characters.";

    if (!lastName) errors.last_name = "Last name is required.";
    else if (lastName.length > 100)
        errors.last_name = "Last name must be at most 100 characters.";

    if (nationalId.length > 50)
        errors.national_id = "National ID must be at most 50 characters.";

    if (
        values.marital_status &&
        !["single", "married"].includes(values.marital_status)
    ) {
        errors.marital_status = "Marital status must be single or married.";
    }

    if (occupation.length > 100)
        errors.occupation = "Occupation must be at most 100 characters.";

    if (values.date_of_birth && !isRealDate(values.date_of_birth)) {
        errors.date_of_birth = "Date of birth must be a valid date.";
    }

    return errors;
}
