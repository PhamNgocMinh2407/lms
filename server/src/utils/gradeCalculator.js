export const calculateTotalGrade = ({
    attendance = 0,
    assignment = 0,
    midterm = 0,
    finalExam = 0
}) => {
    const total =
        attendance * 0.1 +
        assignment * 0.2 +
        midterm * 0.3 +
        finalExam * 0.4;

    return Number(total.toFixed(2));
};

export const calculateLetterGrade = (total) => {
    if (total >= 8.5) return "A";
    if (total >= 8.0) return "B+";
    if (total >= 7.0) return "B";
    if (total >= 6.5) return "C+";
    if (total >= 5.5) return "C";
    if (total >= 4.0) return "D";
    return "F";
};

export const isValidGradeValue = (value) => {
    const numberValue = Number(value);

    return (
        Number.isFinite(numberValue) &&
        numberValue >= 0 &&
        numberValue <= 10
    );
};